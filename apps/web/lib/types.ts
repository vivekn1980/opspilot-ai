export type Role = "ADMIN" | "VIEWER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export type AiProvider = "KIMI" | "ANTHROPIC";

export interface AppSettings {
  aiProvider: AiProvider;
}

export type Severity = "SEV1" | "SEV2" | "SEV3" | "SEV4";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  rawLogs: string | null;
  logAnalysis: string | null;
  rcaReport: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProblemStatus = "OPEN" | "IDENTIFIED" | "RESOLVED";

export interface Problem {
  id: string;
  title: string;
  description: string;
  status: ProblemStatus;
  rootCause: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ChangeStatus = "PROPOSED" | "APPROVED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Change {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  status: ChangeStatus;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sop {
  id: string;
  title: string;
  content: string;
  sourceIncidentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Doc {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResult {
  answer: string;
  sources: { id: string; title: string }[];
}

export interface ShiftHandover {
  id: string;
  summary: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface CustomerUpdate {
  id: string;
  incidentId: string;
  content: string;
  createdAt: string;
}

export interface KpiSummary {
  totalIncidents: number;
  openIncidents: number;
  countsBySeverity: Record<string, number>;
  countsByStatus: Record<string, number>;
  mttrHours: number | null;
  slaBreaches: number;
  slaTargetHours: Record<string, number>;
  generatedAt: string;
}

export type RiskStatus = "OPEN" | "MITIGATING" | "ACCEPTED" | "CLOSED";

export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  status: RiskStatus;
  mitigation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CapacityReport {
  id: string;
  metricName: string;
  rawData: string;
  narrative: string;
  createdAt: string;
}

export interface RunbookStep {
  order: number;
  description: string;
  command?: string;
}

export interface RunbookStepResult {
  order: number;
  completed: boolean;
  note?: string;
}

export interface Runbook {
  id: string;
  title: string;
  description: string;
  steps: RunbookStep[];
  createdAt: string;
  updatedAt: string;
}

export type RunbookRunStatus = "IN_PROGRESS" | "COMPLETED";

export interface RunbookRun {
  id: string;
  runbookId: string;
  status: RunbookRunStatus;
  stepResults: RunbookStepResult[];
  startedAt: string;
  completedAt: string | null;
}

export interface ExecutiveReport {
  id: string;
  content: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface ServiceReviewReport {
  id: string;
  accountName: string;
  content: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface Metric {
  id: string;
  name: string;
  rawData: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringAskResult {
  answer: string;
  sources: { id: string; name: string }[];
}

export interface NotificationStatus {
  configured: boolean;
}

export interface AlertResult {
  sent: boolean;
  reason?: string;
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  meta: string;
  href: string;
}

export interface AiUsageProviderSummary {
  provider: string;
  calls: number;
  successes: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  avgLatencyMs: number;
}

export interface AiUsageSummary {
  totalCalls: number;
  totalFailures: number;
  providers: AiUsageProviderSummary[];
}

export interface AiUsageLogEntry {
  id: string;
  provider: string;
  feature: string;
  success: boolean;
  errorMessage: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
  createdAt: string;
}
