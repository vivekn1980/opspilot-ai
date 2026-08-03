import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { CreateMetricDto } from "./dto/create-metric.dto";

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  create(dto: CreateMetricDto) {
    return this.prisma.metric.create({ data: dto });
  }

  findAll() {
    return this.prisma.metric.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const metric = await this.prisma.metric.findUnique({ where: { id } });
    if (!metric) {
      throw new NotFoundException(`Metric ${id} not found`);
    }
    return metric;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.metric.delete({ where: { id } });
  }

  async ask(question: string) {
    const metrics = await this.prisma.metric.findMany({ orderBy: { createdAt: "desc" } });
    const answer = await this.aiService.analyzeMetrics(
      question,
      metrics.map((m) => ({ name: m.name, rawData: m.rawData })),
    );
    return { answer, sources: metrics.map((m) => ({ id: m.id, name: m.name })) };
  }
}
