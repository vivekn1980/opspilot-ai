import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { KpiService } from "../kpi/kpi.service";

@Injectable()
export class ExecutiveReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly kpiService: KpiService,
  ) {}

  findAll() {
    return this.prisma.executiveReport.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const report = await this.prisma.executiveReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Executive report ${id} not found`);
    }
    return report;
  }

  async generate(periodStart: string, periodEnd: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const [incidents, changes, kpi] = await Promise.all([
      this.prisma.incident.findMany({ where: { createdAt: { gte: start, lte: end } } }),
      this.prisma.change.findMany({ where: { createdAt: { gte: start, lte: end } } }),
      this.kpiService.getSummary(),
    ]);

    const kpiSummary =
      `As of now (all-time, not period-scoped): ${kpi.totalIncidents} total incidents, ` +
      `${kpi.openIncidents} open, MTTR ${kpi.mttrHours ? kpi.mttrHours.toFixed(1) + "h" : "n/a"}, ` +
      `${kpi.slaBreaches} SLA breach(es).`;

    const content = await this.aiService.generateExecutiveReport({
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      kpiSummary,
      incidents: incidents.map((i) => ({ title: i.title, severity: i.severity, status: i.status })),
      changes: changes.map((c) => ({ title: c.title, status: c.status, riskLevel: c.riskLevel })),
    });

    return this.prisma.executiveReport.create({
      data: { content, periodStart: start, periodEnd: end },
    });
  }
}
