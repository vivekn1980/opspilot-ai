import { Injectable } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5";

@Injectable()
export class AiService {
  private readonly client = new Anthropic();

  private extractText(content: Anthropic.ContentBlock[]): string {
    const block = content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "";
  }

  async analyzeLogs(rawLogs: string): Promise<string> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: "medium" },
      system:
        "You are the AI Log Analyzer inside OpsPilot AI, an IT operations platform. " +
        "Given raw log excerpts from an incident, identify error patterns, anomalies, and the most " +
        "likely underlying cause. Respond in short markdown sections: 'Key Errors', 'Patterns', " +
        "'Likely Cause'. Be concrete and cite specific log lines where relevant. Do not pad with filler.",
      messages: [
        {
          role: "user",
          content: `Analyze the following logs:\n\n${rawLogs}`,
        },
      ],
    });
    return this.extractText(response.content);
  }

  async generateRca(input: {
    title: string;
    description: string;
    logAnalysis?: string | null;
  }): Promise<string> {
    const context = [
      `Incident title: ${input.title}`,
      `Incident description: ${input.description}`,
      input.logAnalysis ? `Log analysis so far:\n${input.logAnalysis}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: "medium" },
      system:
        "You are the RCA Generator inside OpsPilot AI. Draft a root cause analysis document from the " +
        "incident context provided. Use markdown with these sections: 'Summary', 'Timeline', " +
        "'Root Cause', 'Impact', 'Remediation', 'Follow-up Actions'. Where information is missing, " +
        "state the assumption plainly instead of inventing specifics.",
      messages: [
        {
          role: "user",
          content: `Draft an RCA from this incident context:\n\n${context}`,
        },
      ],
    });
    return this.extractText(response.content);
  }

  async generateSop(input: {
    title: string;
    description: string;
    logAnalysis?: string | null;
    rcaReport?: string | null;
  }): Promise<string> {
    const context = [
      `Incident title: ${input.title}`,
      `Incident description: ${input.description}`,
      input.logAnalysis ? `Log analysis:\n${input.logAnalysis}` : null,
      input.rcaReport ? `RCA report:\n${input.rcaReport}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: "medium" },
      system:
        "You are the SOP Generator inside OpsPilot AI. Turn a resolved incident into a draft Standard " +
        "Operating Procedure a future on-call engineer can follow to detect and resolve the same class " +
        "of issue. Use markdown with sections: 'When to Use This SOP', 'Detection', 'Diagnosis Steps', " +
        "'Resolution Steps', 'Prevention'. Write imperative, numbered steps. Where the incident record " +
        "doesn't give enough detail for a step, state the assumption plainly instead of inventing specifics.",
      messages: [
        {
          role: "user",
          content: `Draft an SOP from this resolved incident:\n\n${context}`,
        },
      ],
    });
    return this.extractText(response.content);
  }

  async chatWithDocs(question: string, contextDocs: { title: string; content: string }[]): Promise<string> {
    const context = contextDocs
      .map((d, i) => `Document ${i + 1}: ${d.title}\n${d.content}`)
      .join("\n\n---\n\n");

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "medium" },
      system:
        "You are the AI Chat with Documentation feature inside OpsPilot AI. Answer the user's question " +
        "using only the provided documents. If the documents don't contain the answer, say so plainly " +
        "instead of guessing. Cite which document(s) you drew from by title.",
      messages: [
        {
          role: "user",
          content: context
            ? `Documents:\n\n${context}\n\n---\n\nQuestion: ${question}`
            : `No documents were retrieved for this question. Question: ${question}`,
        },
      ],
    });
    return this.extractText(response.content);
  }

  async summarizeShift(input: {
    periodStart: string;
    periodEnd: string;
    incidents: { title: string; severity: string; status: string; description: string }[];
  }): Promise<string> {
    const incidentList = input.incidents.length
      ? input.incidents
          .map((i) => `- [${i.severity}/${i.status}] ${i.title}: ${i.description}`)
          .join("\n")
      : "No incidents were logged during this period.";

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "medium" },
      system:
        "You are the Shift Handover generator inside OpsPilot AI. Summarize a shift's activity into a " +
        "structured handover note for the next on-call engineer. Use markdown sections: 'Overview', " +
        "'Open Items Needing Attention', 'Resolved This Shift', 'Watch List'. Be concrete and brief — " +
        "the reader is about to take over and needs the essentials, not a narrative.",
      messages: [
        {
          role: "user",
          content: `Shift window: ${input.periodStart} to ${input.periodEnd}\n\nIncidents during this window:\n${incidentList}`,
        },
      ],
    });
    return this.extractText(response.content);
  }

  async generateCustomerUpdate(input: {
    title: string;
    description: string;
    severity: string;
    status: string;
    priorUpdates: string[];
  }): Promise<string> {
    const history = input.priorUpdates.length
      ? `Previous updates sent to the customer, oldest first:\n${input.priorUpdates.map((u, i) => `${i + 1}. ${u}`).join("\n")}`
      : "No previous updates have been sent for this incident.";

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system:
        "You are the Customer Update Generator inside OpsPilot AI. Draft a short, plain-language status " +
        "update for affected customers about an ongoing or resolved incident. No internal jargon, ticket " +
        "IDs, hostnames, or engineering detail — describe customer-visible impact and what's being done " +
        "in terms a non-technical reader understands. Match tone to severity: reassuring but honest for " +
        "high severity, brief for low severity. If this is a follow-up, don't repeat what was already " +
        "said — report what's changed. 3-5 sentences, no markdown headers.",
      messages: [
        {
          role: "user",
          content:
            `Incident: ${input.title}\n` +
            `Internal description: ${input.description}\n` +
            `Severity: ${input.severity}\n` +
            `Current status: ${input.status}\n\n` +
            history,
        },
      ],
    });
    return this.extractText(response.content);
  }
}
