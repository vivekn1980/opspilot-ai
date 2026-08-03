import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";

@Injectable()
export class ShiftHandoversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  findAll() {
    return this.prisma.shiftHandover.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const handover = await this.prisma.shiftHandover.findUnique({ where: { id } });
    if (!handover) {
      throw new NotFoundException(`Shift handover ${id} not found`);
    }
    return handover;
  }

  async generate(periodStart: string, periodEnd: string, userId: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const incidents = await this.prisma.incident.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "asc" },
    });

    const summary = await this.aiService.summarizeShift({
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      incidents: incidents.map((i) => ({
        title: i.title,
        severity: i.severity,
        status: i.status,
        description: i.description,
      })),
    });

    return this.prisma.shiftHandover.create({
      data: { summary, periodStart: start, periodEnd: end, createdById: userId },
    });
  }
}
