import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "./notifications.service";
import { RESOLVED_STATUSES, SLA_TARGET_HOURS } from "../kpi/sla-targets";

// No job scheduler in the MVP stack, so this is a plain in-process interval
// rather than a real cron worker — fine for a single instance, would need to
// move to a shared scheduler before running more than one API replica.
export const SLA_CHECK_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class SlaMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SlaMonitorService.name);
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    void this.checkForBreaches();
    this.timer = setInterval(() => void this.checkForBreaches(), SLA_CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async checkForBreaches() {
    const candidates = await this.prisma.incident.findMany({
      where: {
        status: { notIn: RESOLVED_STATUSES },
        slaBreachNotifiedAt: null,
      },
    });

    const now = Date.now();

    for (const incident of candidates) {
      const ageHours = (now - incident.createdAt.getTime()) / (1000 * 60 * 60);
      const target = SLA_TARGET_HOURS[incident.severity] ?? Infinity;
      if (ageHours <= target) continue;

      this.notifications.notifyBestEffort(
        `⏰ SLA breach: [${incident.severity}] "${incident.title}" has been open ${ageHours.toFixed(1)}h ` +
          `(target ${target}h). Incident ID: ${incident.id}`,
      );

      await this.prisma.incident.update({
        where: { id: incident.id },
        data: { slaBreachNotifiedAt: new Date() },
      });
    }

    if (candidates.length > 0) {
      this.logger.debug(`SLA sweep checked ${candidates.length} open incident(s)`);
    }
  }
}
