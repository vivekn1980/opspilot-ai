// Response-time SLA targets by severity, in hours. Not configurable in the
// MVP — a real implementation would let each customer set their own targets.
// Shared between KpiService (breach counting) and the SLA breach notifier.
export const SLA_TARGET_HOURS: Record<string, number> = {
  SEV1: 4,
  SEV2: 8,
  SEV3: 24,
  SEV4: 72,
};

export const RESOLVED_STATUSES = ["RESOLVED", "CLOSED"];
