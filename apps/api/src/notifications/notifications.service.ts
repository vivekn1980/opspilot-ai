import { Injectable, Logger } from "@nestjs/common";

export interface AlertResult {
  sent: boolean;
  reason?: string;
}

// Slack-compatible incoming webhook: POST { text }. Discord and Microsoft
// Teams both have Slack-compatible (or easily adaptable) webhook endpoints,
// so this one integration covers the common cases without extra config.
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  isConfigured(): boolean {
    return Boolean(process.env.SLACK_WEBHOOK_URL);
  }

  async sendAlert(text: string): Promise<AlertResult> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return { sent: false, reason: "SLACK_WEBHOOK_URL is not configured" };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        return { sent: false, reason: `Webhook responded with ${response.status}` };
      }
      return { sent: true };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to deliver alert: ${reason}`);
      return { sent: false, reason };
    }
  }

  // Fire-and-forget wrapper for call sites that must never block or throw on
  // a notification failure (incident creation, the SLA sweep). Logs instead.
  notifyBestEffort(text: string): void {
    this.sendAlert(text)
      .then((result) => {
        if (!result.sent && result.reason !== "SLACK_WEBHOOK_URL is not configured") {
          this.logger.warn(`Alert not delivered: ${result.reason}`);
        }
      })
      .catch(() => {
        // sendAlert never rejects, but guard anyway — a notification must
        // never surface as an unhandled rejection.
      });
  }
}
