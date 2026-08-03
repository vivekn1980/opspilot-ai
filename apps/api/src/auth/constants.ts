export const AUTH_COOKIE_NAME = "opspilot_token";
export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Only used if JWT_SECRET is unset. Fine for a single-machine local dev
// tool with no auth history to protect; must be overridden via env before
// this app runs anywhere shared or persistent.
export const DEV_FALLBACK_JWT_SECRET = "dev-insecure-secret-change-me";
