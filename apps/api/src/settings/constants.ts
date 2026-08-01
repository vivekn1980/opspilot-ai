export const AI_PROVIDERS = ["KIMI", "ANTHROPIC"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const DEFAULT_AI_PROVIDER: AiProvider = "KIMI";

export const AI_PROVIDER_SETTING_KEY = "aiProvider";
