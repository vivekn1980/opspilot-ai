import { Injectable, RequestTimeoutException } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AiProvider } from "../settings/constants";
import { SettingsService } from "../settings/settings.service";
import { AiUsageService } from "../ai-usage/ai-usage.service";

const ANTHROPIC_MODEL = "claude-opus-5";
const KIMI_MODEL = "moonshotai/kimi-k3-free";
const KIMI_BASE_URL = "https://api.tokenrouter.com/v1";

// Free-tier Kimi completions have been observed taking 90s+ for larger
// outputs (log analysis, RCA). This is a safety net against a truly dead
// upstream, not a tight budget — set well above observed normal latency.
const AI_REQUEST_TIMEOUT_MS = 150_000;

const PROVIDER_LABEL: Record<AiProvider, string> = {
  KIMI: "Kimi K3",
  ANTHROPIC: "Anthropic Claude",
};

interface CompleteParams {
  system: string;
  userContent: string;
  maxTokens: number;
  feature: string;
}

interface ProviderResponse {
  text: string;
  inputTokens: number | null;
  outputTokens: number | null;
}

@Injectable()
export class AiService {
  // maxRetries: 0 — the SDK default (2) retries on timeout too, which turns
  // a "150s ceiling" into a silent "up to 450s" wait. A clean, predictable
  // timeout beats an automatic retry here: if it's genuinely slow, retrying
  // won't make it faster, and the user can just click the button again.
  private readonly anthropicClient = new Anthropic({ timeout: AI_REQUEST_TIMEOUT_MS, maxRetries: 0 });
  // A non-empty placeholder means the client never throws at construction
  // time if the key is unset — the real error surfaces as a normal 401 on
  // the first request, same UX as the Anthropic client with no API key.
  private readonly kimiClient = new OpenAI({
    apiKey: process.env.TOKENROUTER_API_KEY || "missing-tokenrouter-api-key",
    baseURL: KIMI_BASE_URL,
    timeout: AI_REQUEST_TIMEOUT_MS,
    maxRetries: 0,
  });

  constructor(
    private readonly settingsService: SettingsService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  private isTimeoutError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /timed?\s?out/i.test(message);
  }

  private async complete(params: CompleteParams): Promise<string> {
    const provider = await this.settingsService.getAiProvider();
    const startedAt = Date.now();
    try {
      const response =
        provider === "ANTHROPIC"
          ? await this.completeWithAnthropic(params)
          : await this.completeWithKimi(params);

      this.aiUsageService.recordBestEffort({
        provider,
        feature: params.feature,
        success: true,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        latencyMs: Date.now() - startedAt,
      });

      return response.text;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.aiUsageService.recordBestEffort({
        provider,
        feature: params.feature,
        success: false,
        errorMessage,
        inputTokens: null,
        outputTokens: null,
        latencyMs: Date.now() - startedAt,
      });

      if (this.isTimeoutError(error)) {
        throw new RequestTimeoutException(
          `${PROVIDER_LABEL[provider]} didn't respond within ${AI_REQUEST_TIMEOUT_MS / 1000}s. ` +
            "Try again, or switch providers in Settings.",
        );
      }
      throw error;
    }
  }

  private async completeWithAnthropic(params: CompleteParams): Promise<ProviderResponse> {
    const response = await this.anthropicClient.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: params.maxTokens,
      output_config: { effort: "medium" },
      system: params.system,
      messages: [{ role: "user", content: params.userContent }],
    });
    const block = response.content.find((b) => b.type === "text");
    return {
      text: block && block.type === "text" ? block.text : "",
      inputTokens: response.usage?.input_tokens ?? null,
      outputTokens: response.usage?.output_tokens ?? null,
    };
  }

  private async completeWithKimi(params: CompleteParams): Promise<ProviderResponse> {
    const response = await this.kimiClient.chat.completions.create({
      model: KIMI_MODEL,
      max_tokens: params.maxTokens,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.userContent },
      ],
    });
    return {
      text: response.choices[0]?.message?.content ?? "",
      inputTokens: response.usage?.prompt_tokens ?? null,
      outputTokens: response.usage?.completion_tokens ?? null,
    };
  }

  async analyzeLogs(rawLogs: string): Promise<string> {
    return this.complete({
      feature: "analyzeLogs",
      maxTokens: 4096,
      system:
        "You are the AI Log Analyzer inside OpsPilot AI, an IT operations platform. " +
        "Given raw log excerpts from an incident, identify error patterns, anomalies, and the most " +
        "likely underlying cause. Respond in short markdown sections: 'Key Errors', 'Patterns', " +
        "'Likely Cause'. Be concrete and cite specific log lines where relevant. Do not pad with filler.",
      userContent: `Analyze the following logs:\n\n${rawLogs}`,
    });
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

    return this.complete({
      feature: "generateRca",
      maxTokens: 4096,
      system:
        "You are the RCA Generator inside OpsPilot AI. Draft a root cause analysis document from the " +
        "incident context provided. Use markdown with these sections: 'Summary', 'Timeline', " +
        "'Root Cause', 'Impact', 'Remediation', 'Follow-up Actions'. Where information is missing, " +
        "state the assumption plainly instead of inventing specifics.",
      userContent: `Draft an RCA from this incident context:\n\n${context}`,
    });
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

    return this.complete({
      feature: "generateSop",
      maxTokens: 4096,
      system:
        "You are the SOP Generator inside OpsPilot AI. Turn a resolved incident into a draft Standard " +
        "Operating Procedure a future on-call engineer can follow to detect and resolve the same class " +
        "of issue. Use markdown with sections: 'When to Use This SOP', 'Detection', 'Diagnosis Steps', " +
        "'Resolution Steps', 'Prevention'. Write imperative, numbered steps. Where the incident record " +
        "doesn't give enough detail for a step, state the assumption plainly instead of inventing specifics.",
      userContent: `Draft an SOP from this resolved incident:\n\n${context}`,
    });
  }

  async chatWithDocs(question: string, contextDocs: { title: string; content: string }[]): Promise<string> {
    const context = contextDocs
      .map((d, i) => `Document ${i + 1}: ${d.title}\n${d.content}`)
      .join("\n\n---\n\n");

    return this.complete({
      feature: "chatWithDocs",
      maxTokens: 2048,
      system:
        "You are the AI Chat with Documentation feature inside OpsPilot AI. Answer the user's question " +
        "using only the provided documents. If the documents don't contain the answer, say so plainly " +
        "instead of guessing. Cite which document(s) you drew from by title.",
      userContent: context
        ? `Documents:\n\n${context}\n\n---\n\nQuestion: ${question}`
        : `No documents were retrieved for this question. Question: ${question}`,
    });
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

    return this.complete({
      feature: "summarizeShift",
      maxTokens: 2048,
      system:
        "You are the Shift Handover generator inside OpsPilot AI. Summarize a shift's activity into a " +
        "structured handover note for the next on-call engineer. Use markdown sections: 'Overview', " +
        "'Open Items Needing Attention', 'Resolved This Shift', 'Watch List'. Be concrete and brief — " +
        "the reader is about to take over and needs the essentials, not a narrative.",
      userContent: `Shift window: ${input.periodStart} to ${input.periodEnd}\n\nIncidents during this window:\n${incidentList}`,
    });
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

    return this.complete({
      feature: "generateCustomerUpdate",
      maxTokens: 1024,
      system:
        "You are the Customer Update Generator inside OpsPilot AI. Draft a short, plain-language status " +
        "update for affected customers about an ongoing or resolved incident. No internal jargon, ticket " +
        "IDs, hostnames, or engineering detail — describe customer-visible impact and what's being done " +
        "in terms a non-technical reader understands. Match tone to severity: reassuring but honest for " +
        "high severity, brief for low severity. If this is a follow-up, don't repeat what was already " +
        "said — report what's changed. 3-5 sentences, no markdown headers.",
      userContent:
        `Incident: ${input.title}\n` +
        `Internal description: ${input.description}\n` +
        `Severity: ${input.severity}\n` +
        `Current status: ${input.status}\n\n` +
        history,
    });
  }

  async draftRiskMitigation(input: {
    title: string;
    description: string;
    likelihood: string;
    impact: string;
  }): Promise<string> {
    return this.complete({
      feature: "draftRiskMitigation",
      maxTokens: 1536,
      system:
        "You are the Risk Register assistant inside OpsPilot AI. Given a risk's description, likelihood, " +
        "and impact, draft a mitigation plan. Use markdown sections: 'Recommended Mitigation', " +
        "'Monitoring / Early Warning Signs', 'Contingency if the Risk Materializes'. Be concrete and " +
        "specific to the risk described — avoid generic advice like 'improve monitoring' without saying " +
        "what to monitor.",
      userContent:
        `Risk: ${input.title}\n` +
        `Description: ${input.description}\n` +
        `Likelihood: ${input.likelihood}\n` +
        `Impact: ${input.impact}`,
    });
  }

  async analyzeCapacity(input: { metricName: string; rawData: string }): Promise<string> {
    return this.complete({
      feature: "analyzeCapacity",
      maxTokens: 2048,
      system:
        "You are the Capacity Planning assistant inside OpsPilot AI. Given a raw time series for one " +
        "metric, identify the trend, flag anomalies or inflection points, and give a plain-language " +
        "forecast of when the metric is likely to become a problem if the trend continues (or state that " +
        "it looks stable if it does). Use markdown sections: 'Trend', 'Anomalies', 'Forecast', " +
        "'Recommendation'. You are reasoning from the numbers given — don't invent data points, and say " +
        "so plainly if the series is too short or noisy to forecast confidently.",
      userContent: `Metric: ${input.metricName}\n\nData:\n${input.rawData}`,
    });
  }

  async generateExecutiveReport(input: {
    periodStart: string;
    periodEnd: string;
    kpiSummary: string;
    incidents: { title: string; severity: string; status: string }[];
    changes: { title: string; status: string; riskLevel: string }[];
  }): Promise<string> {
    const incidentList = input.incidents.length
      ? input.incidents.map((i) => `- [${i.severity}/${i.status}] ${i.title}`).join("\n")
      : "No incidents in this period.";
    const changeList = input.changes.length
      ? input.changes.map((c) => `- [${c.riskLevel}/${c.status}] ${c.title}`).join("\n")
      : "No changes in this period.";

    return this.complete({
      feature: "generateExecutiveReport",
      maxTokens: 3072,
      system:
        "You are the Executive Report generator inside OpsPilot AI. Roll up a period's operational data " +
        "into a leadership-level summary — assume the reader has limited time and no operational detail " +
        "memorized. Use markdown sections: 'Headline', 'Reliability Summary', 'Notable Incidents', " +
        "'Change Activity', 'Risks and Recommendations'. Lead with the headline takeaway, not a recap of " +
        "every event. Translate technical severity into business impact where you can.",
      userContent:
        `Reporting period: ${input.periodStart} to ${input.periodEnd}\n\n` +
        `KPI summary:\n${input.kpiSummary}\n\n` +
        `Incidents:\n${incidentList}\n\n` +
        `Changes:\n${changeList}`,
    });
  }

  async analyzeMetrics(question: string, metrics: { name: string; rawData: string }[]): Promise<string> {
    const context = metrics
      .map((m, i) => `Metric ${i + 1}: ${m.name}\n${m.rawData}`)
      .join("\n\n---\n\n");

    return this.complete({
      feature: "analyzeMetrics",
      maxTokens: 2048,
      system:
        "You are the AI Monitoring Assistant inside OpsPilot AI. Answer the user's question using only " +
        "the provided metric time series, and proactively flag any anomalies, spikes, drops, or suspicious " +
        "patterns you notice in the data — even ones the question didn't directly ask about. Reason only " +
        "from the numbers given; if a metric needed to answer isn't provided, say so plainly instead of " +
        "guessing. Cite metric names when relevant.",
      userContent: context
        ? `Metrics:\n\n${context}\n\n---\n\nQuestion: ${question}`
        : `No metrics were provided for this question. Question: ${question}`,
    });
  }

  async generateServiceReviewReport(input: {
    accountName: string;
    periodStart: string;
    periodEnd: string;
    kpiSummary: string;
    incidents: { title: string; severity: string; status: string }[];
  }): Promise<string> {
    const incidentList = input.incidents.length
      ? input.incidents.map((i) => `- [${i.severity}/${i.status}] ${i.title}`).join("\n")
      : "No incidents in this period.";

    return this.complete({
      feature: "generateServiceReviewReport",
      maxTokens: 3072,
      system:
        "You are the Service Review Report generator inside OpsPilot AI, used mainly by MSPs for periodic " +
        "account reviews (QBRs) with their customers. Write for the customer's audience, not internal " +
        "engineering — professional, reassuring where warranted, honest about issues. Use markdown " +
        "sections: 'Summary', 'Service Performance', 'Key Incidents', 'Looking Ahead'. Avoid internal " +
        "jargon, ticket IDs, or hostnames.",
      userContent:
        `Account: ${input.accountName}\n` +
        `Reporting period: ${input.periodStart} to ${input.periodEnd}\n\n` +
        `KPI summary:\n${input.kpiSummary}\n\n` +
        `Incidents:\n${incidentList}`,
    });
  }
}
