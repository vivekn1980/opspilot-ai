import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { KpiService } from "../kpi/kpi.service";

@Injectable()
export class ServiceReviewReportsService {
  constructor(
    private readonly prisma: PrismaService,
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

  // NOTE: the platform has no multi-tenant/account model yet, so this pulls
  // from the same shared incident data as Executive Reports — accountName is
  // a label for framing the report, not a real per-account filter. A true
  // per-account MSP view needs tenant-scoped incidents (see docs/ARCHITECTURE.md).
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

    return this.prisma.serviceReviewReport.create({
      data: { accountName, content, periodStart: start, periodEnd: end, createdById: userId },
    });
  }
}
