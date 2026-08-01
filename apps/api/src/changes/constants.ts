export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const CHANGE_STATUSES = [
  "PROPOSED",
  "APPROVED",
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];
