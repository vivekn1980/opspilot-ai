import { Injectable, NotFoundException } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { AiService } from "../ai/ai.service";
import { KpiService } from "../kpi/kpi.service";

@Injectable()
export class ServiceReviewReportsService {
  constructor(
    private readonly prisma: TenantPrismaService,
    private readonly aiService: AiService,
    private readonly kpiService: KpiService,
  ) {}

  findAll() {
    return this.prisma.serviceReviewReport.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const report = await this.prisma.serviceReviewReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Service review report ${id} not found`);
    }
    return report;
  }

  // accountName is still just a label for framing the report, not a filter
  // on which incidents get pulled in — that part of the platform has one
  // tenant's incidents in scope (via TenantPrismaService), not per-MSP-
  // customer sub-accounts within a tenant. That's a further level of
  // scoping this migration didn't add.
  async generate(accountName: string, periodStart: string, periodEnd: string, userId: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const [incidents, kpi] = await Promise.all([
      this.prisma.incident.findMany({ where: { createdAt: { gte: start, lte: end } } }),
      this.kpiService.getSummary(),
    ]);

    const kpiSummary =
      `As of now (all-time, not period-scoped): ${kpi.totalIncidents} total incidents, ` +
      `${kpi.openIncidents} open, MTTR ${kpi.mttrHours ? kpi.mttrHours.toFixed(1) + "h" : "n/a"}.`;

    const content = await this.aiService.generateServiceReviewReport({
      accountName,
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      kpiSummary,
      incidents: incidents.map((i) => ({ title: i.title, severity: i.severity, status: i.status })),
    });

    // organizationId: "" is a placeholder overwritten by the tenant-scoping
    // extension — see the comment in AiUsageService.recordBestEffort.
    return this.prisma.serviceReviewReport.create({
      data: { organizationId: "", accountName, content, periodStart: start, periodEnd: end, createdById: userId },
    });
  }
}
