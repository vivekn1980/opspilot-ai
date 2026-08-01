export const PROBLEM_STATUSES = ["OPEN", "IDENTIFIED", "RESOLVED"] as const;
export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];
