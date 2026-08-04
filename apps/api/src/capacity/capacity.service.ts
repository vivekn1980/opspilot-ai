import { Injectable, NotFoundException } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { AiService } from "../ai/ai.service";

@Injectable()
export class CapacityService {
  constructor(
    private readonly prisma: TenantPrismaService,
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
    // organizationId: "" is a placeholder overwritten by the tenant-scoping
    // extension — see the comment in AiUsageService.recordBestEffort.
    return this.prisma.capacityReport.create({
      data: { organizationId: "", metricName, rawData, narrative, createdById: userId },
    });
  }
}
