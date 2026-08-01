import { Incident } from "./types";

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
};
