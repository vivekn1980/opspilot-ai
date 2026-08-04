import { IntegrationsService } from "./integrations.service";

const ENV_KEYS = [
  "SLACK_WEBHOOK_URL",
  "SERVICENOW_INSTANCE_URL",
  "SERVICENOW_USERNAME",
  "SERVICENOW_PASSWORD",
  "PAGERDUTY_API_KEY",
  "TOKENROUTER_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

describe("IntegrationsService.getStatus", () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      original[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  it("reports every integration as not configured when no env vars are set", () => {
    const { integrations } = new IntegrationsService().getStatus();
    expect(integrations.every((i) => i.configured === false)).toBe(true);
    expect(integrations.map((i) => i.key).sort()).toEqual(
      ["anthropic", "pagerduty", "servicenow", "slack", "tokenrouter"].sort(),
    );
  });

  it("marks Slack configured once SLACK_WEBHOOK_URL is set", () => {
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.example/x";
    const { integrations } = new IntegrationsService().getStatus();
    expect(integrations.find((i) => i.key === "slack")?.configured).toBe(true);
  });

  it("requires all three ServiceNow env vars before marking it configured", () => {
    process.env.SERVICENOW_INSTANCE_URL = "https://dev12345.service-now.com";
    process.env.SERVICENOW_USERNAME = "admin";
    // password intentionally left unset
    const { integrations } = new IntegrationsService().getStatus();
    expect(integrations.find((i) => i.key === "servicenow")?.configured).toBe(false);

    process.env.SERVICENOW_PASSWORD = "secret";
    const { integrations: withPassword } = new IntegrationsService().getStatus();
    expect(withPassword.find((i) => i.key === "servicenow")?.configured).toBe(true);
  });
});
