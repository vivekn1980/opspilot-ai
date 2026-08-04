import { Injectable } from "@nestjs/common";

export interface IntegrationStatus {
  key: string;
  name: string;
  configured: boolean;
}

// A single at-a-glance list of every external system the app knows how to
// talk to (or is planned to) — "configured" just means the relevant env
// var(s) are set, not that a connection was actually tested. ServiceNow and
// PagerDuty aren't built yet; they're listed now so their status is visible
// the moment credentials are added, without needing another Settings change
// once the connectors themselves land.
@Injectable()
export class IntegrationsService {
  getStatus(): { integrations: IntegrationStatus[] } {
    const integrations: IntegrationStatus[] = [
      {
        key: "slack",
        name: "Slack / Webhook Notifications",
        configured: Boolean(process.env.SLACK_WEBHOOK_URL),
      },
      {
        key: "servicenow",
        name: "ServiceNow",
        configured: Boolean(
          process.env.SERVICENOW_INSTANCE_URL &&
            process.env.SERVICENOW_USERNAME &&
            process.env.SERVICENOW_PASSWORD,
        ),
      },
      {
        key: "pagerduty",
        name: "PagerDuty",
        configured: Boolean(process.env.PAGERDUTY_API_KEY),
      },
      {
        key: "tokenrouter",
        name: "Kimi K3 (TokenRouter)",
        configured: Boolean(process.env.TOKENROUTER_API_KEY),
      },
      {
        key: "anthropic",
        name: "Anthropic Claude",
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
      },
    ];
    return { integrations };
  }
}
