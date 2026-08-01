import { ChatResult, Change, Doc, Incident, Problem, ShiftHandover, Sop } from "./types";

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
};
