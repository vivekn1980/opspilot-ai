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
