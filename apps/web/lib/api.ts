import {
  AiProvider,
  AppSettings,
  CapacityReport,
  ChatResult,
  Change,
  CustomerUpdate,
  Doc,
  ExecutiveReport,
  Incident,
  KpiSummary,
  Metric,
  MonitoringAskResult,
  Problem,
  Risk,
  Runbook,
  RunbookRun,
  RunbookStep,
  ServiceReviewReport,
  ShiftHandover,
  Sop,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Incidents
  listIncidents: () => request<Incident[]>("/incidents"),
  getIncident: (id: string) => request<Incident>(`/incidents/${id}`),
  createIncident: (data: {
    title: string;
    description: string;
    severity: string;
    rawLogs?: string;
  }) => request<Incident>("/incidents", { method: "POST", body: JSON.stringify(data) }),
  updateIncident: (id: string, data: Partial<Incident>) =>
    request<Incident>(`/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  analyzeLogs: (id: string, rawLogs?: string) =>
    request<Incident>(`/incidents/${id}/analyze-logs`, {
      method: "POST",
      body: JSON.stringify({ rawLogs }),
    }),
  generateRca: (id: string) =>
    request<Incident>(`/incidents/${id}/generate-rca`, { method: "POST" }),
  listCustomerUpdates: (incidentId: string) =>
    request<CustomerUpdate[]>(`/incidents/${incidentId}/customer-updates`),
  generateCustomerUpdate: (incidentId: string) =>
    request<CustomerUpdate>(`/incidents/${incidentId}/customer-updates/generate`, { method: "POST" }),

  // Problems
  listProblems: () => request<Problem[]>("/problems"),
  getProblem: (id: string) => request<Problem>(`/problems/${id}`),
  createProblem: (data: { title: string; description: string; status?: string; rootCause?: string }) =>
    request<Problem>("/problems", { method: "POST", body: JSON.stringify(data) }),
  updateProblem: (id: string, data: Partial<Problem>) =>
    request<Problem>(`/problems/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Changes
  listChanges: () => request<Change[]>("/changes"),
  getChange: (id: string) => request<Change>(`/changes/${id}`),
  createChange: (data: {
    title: string;
    description: string;
    riskLevel?: string;
    status?: string;
    scheduledAt?: string;
  }) => request<Change>("/changes", { method: "POST", body: JSON.stringify(data) }),
  updateChange: (id: string, data: Partial<Change>) =>
    request<Change>(`/changes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // SOPs
  listSops: () => request<Sop[]>("/sops"),
  getSop: (id: string) => request<Sop>(`/sops/${id}`),
  generateSop: (incidentId: string) =>
    request<Sop>("/sops/generate", { method: "POST", body: JSON.stringify({ incidentId }) }),

  // Docs + Chat
  listDocs: () => request<Doc[]>("/docs"),
  createDoc: (data: { title: string; content: string }) =>
    request<Doc>("/docs", { method: "POST", body: JSON.stringify(data) }),
  chatWithDocs: (question: string) =>
    request<ChatResult>("/docs/chat", { method: "POST", body: JSON.stringify({ question }) }),

  // Shift Handovers
  listShiftHandovers: () => request<ShiftHandover[]>("/shift-handovers"),
  getShiftHandover: (id: string) => request<ShiftHandover>(`/shift-handovers/${id}`),
  generateShiftHandover: (periodStart: string, periodEnd: string) =>
    request<ShiftHandover>("/shift-handovers/generate", {
      method: "POST",
      body: JSON.stringify({ periodStart, periodEnd }),
    }),

  // KPI / SLA Dashboard
  getKpiSummary: () => request<KpiSummary>("/kpi"),

  // Risk Register
  listRisks: () => request<Risk[]>("/risks"),
  getRisk: (id: string) => request<Risk>(`/risks/${id}`),
  createRisk: (data: { title: string; description: string; likelihood?: string; impact?: string }) =>
    request<Risk>("/risks", { method: "POST", body: JSON.stringify(data) }),
  updateRisk: (id: string, data: Partial<Risk>) =>
    request<Risk>(`/risks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  generateRiskMitigation: (id: string) =>
    request<Risk>(`/risks/${id}/generate-mitigation`, { method: "POST" }),

  // Capacity Planning
  listCapacityReports: () => request<CapacityReport[]>("/capacity-reports"),
  getCapacityReport: (id: string) => request<CapacityReport>(`/capacity-reports/${id}`),
  generateCapacityReport: (metricName: string, rawData: string) =>
    request<CapacityReport>("/capacity-reports/generate", {
      method: "POST",
      body: JSON.stringify({ metricName, rawData }),
    }),

  // Runbook Automation
  listRunbooks: () => request<Runbook[]>("/runbooks"),
  getRunbook: (id: string) => request<Runbook>(`/runbooks/${id}`),
  createRunbook: (data: { title: string; description: string; steps: RunbookStep[] }) =>
    request<Runbook>("/runbooks", { method: "POST", body: JSON.stringify(data) }),
  startRunbookRun: (runbookId: string) =>
    request<RunbookRun>(`/runbooks/${runbookId}/runs`, { method: "POST" }),
  listRunbookRuns: (runbookId: string) =>
    request<RunbookRun[]>(`/runbooks/${runbookId}/runs`),
  getRunbookRun: (runbookId: string, runId: string) =>
    request<RunbookRun>(`/runbooks/${runbookId}/runs/${runId}`),
  updateRunbookStep: (runbookId: string, runId: string, order: number, completed: boolean, note?: string) =>
    request<RunbookRun>(`/runbooks/${runbookId}/runs/${runId}/steps`, {
      method: "PUT",
      body: JSON.stringify({ order, completed, note }),
    }),

  // Executive Reports
  listExecutiveReports: () => request<ExecutiveReport[]>("/executive-reports"),
  getExecutiveReport: (id: string) => request<ExecutiveReport>(`/executive-reports/${id}`),
  generateExecutiveReport: (periodStart: string, periodEnd: string) =>
    request<ExecutiveReport>("/executive-reports/generate", {
      method: "POST",
      body: JSON.stringify({ periodStart, periodEnd }),
    }),

  // Service Review Reports
  listServiceReviewReports: () => request<ServiceReviewReport[]>("/service-review-reports"),
  getServiceReviewReport: (id: string) => request<ServiceReviewReport>(`/service-review-reports/${id}`),
  generateServiceReviewReport: (accountName: string, periodStart: string, periodEnd: string) =>
    request<ServiceReviewReport>("/service-review-reports/generate", {
      method: "POST",
      body: JSON.stringify({ accountName, periodStart, periodEnd }),
    }),

  // AI Monitoring Assistant
  listMetrics: () => request<Metric[]>("/metrics"),
  createMetric: (data: { name: string; rawData: string }) =>
    request<Metric>("/metrics", { method: "POST", body: JSON.stringify(data) }),
  askMonitoring: (question: string) =>
    request<MonitoringAskResult>("/metrics/ask", { method: "POST", body: JSON.stringify({ question }) }),

  // Settings
  getSettings: () => request<AppSettings>("/settings"),
  updateSettings: (aiProvider: AiProvider) =>
    request<AppSettings>("/settings", { method: "PUT", body: JSON.stringify({ aiProvider }) }),
};
