export const SEVERITIES = ["SEV1", "SEV2", "SEV3", "SEV4"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const INCIDENT_STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
