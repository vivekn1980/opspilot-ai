import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";

@Injectable()
export class CapacityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  findAll() {
    return this.prisma.capacityReport.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const report = await this.prisma.capacityReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Capacity report ${id} not found`);
    }
    return report;
  }

  async generate(metricName: string, rawData: string, userId: string) {
    const narrative = await this.aiService.analyzeCapacity({ metricName, rawData });
    return this.prisma.capacityReport.create({
      data: { metricName, rawData, narrative, createdById: userId },
    });
  }
}
