export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_STATUSES = ["OPEN", "MITIGATING", "ACCEPTED", "CLOSED"] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];
