import { Injectable } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { RESOLVED_STATUSES, SLA_TARGET_HOURS } from "./sla-targets";

@Injectable()
export class KpiService {
  constructor(private readonly prisma: TenantPrismaService) {}

  async getSummary() {
    const incidents = await this.prisma.incident.findMany();
    const now = Date.now();

    const countsBySeverity: Record<string, number> = { SEV1: 0, SEV2: 0, SEV3: 0, SEV4: 0 };
    const countsByStatus: Record<string, number> = {
      OPEN: 0,
      INVESTIGATING: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    let slaBreaches = 0;
    const resolutionHours: number[] = [];

    for (const incident of incidents) {
      countsBySeverity[incident.severity] = (countsBySeverity[incident.severity] ?? 0) + 1;
      countsByStatus[incident.status] = (countsByStatus[incident.status] ?? 0) + 1;

      const ageHours = (now - incident.createdAt.getTime()) / (1000 * 60 * 60);
      const isOpen = !RESOLVED_STATUSES.includes(incident.status);
      if (isOpen && ageHours > (SLA_TARGET_HOURS[incident.severity] ?? Infinity)) {
        slaBreaches += 1;
      }

      // Approximation: updatedAt isn't a dedicated "resolvedAt" field, so this
      // is only accurate if the last edit was the resolution itself.
      if (RESOLVED_STATUSES.includes(incident.status)) {
        const hours = (incident.updatedAt.getTime() - incident.createdAt.getTime()) / (1000 * 60 * 60);
        resolutionHours.push(hours);
      }
    }

    const mttrHours = resolutionHours.length
      ? resolutionHours.reduce((sum, h) => sum + h, 0) / resolutionHours.length
      : null;

    return {
      totalIncidents: incidents.length,
      openIncidents: incidents.length - countsByStatus.RESOLVED - countsByStatus.CLOSED,
      countsBySeverity,
      countsByStatus,
      mttrHours,
      slaBreaches,
      slaTargetHours: SLA_TARGET_HOURS,
      generatedAt: new Date().toISOString(),
    };
  }
}
