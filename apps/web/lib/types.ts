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
