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
}
