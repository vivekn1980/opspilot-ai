import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { CreateRiskDto } from "./dto/create-risk.dto";
import { UpdateRiskDto } from "./dto/update-risk.dto";

@Injectable()
export class RisksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  create(dto: CreateRiskDto) {
    return this.prisma.risk.create({ data: dto });
  }

  findAll() {
    return this.prisma.risk.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const risk = await this.prisma.risk.findUnique({ where: { id } });
    if (!risk) {
      throw new NotFoundException(`Risk ${id} not found`);
    }
    return risk;
  }

  async update(id: string, dto: UpdateRiskDto) {
    await this.findOne(id);
    return this.prisma.risk.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.risk.delete({ where: { id } });
  }

  async generateMitigation(id: string) {
    const risk = await this.findOne(id);
    const mitigation = await this.aiService.draftRiskMitigation({
      title: risk.title,
      description: risk.description,
      likelihood: risk.likelihood,
      impact: risk.impact,
    });
    return this.prisma.risk.update({ where: { id }, data: { mitigation } });
  }
}
