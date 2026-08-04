import { Injectable, NotFoundException } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { AiService } from "../ai/ai.service";
import { CreateRiskDto } from "./dto/create-risk.dto";
import { UpdateRiskDto } from "./dto/update-risk.dto";

@Injectable()
export class RisksService {
  constructor(
    private readonly prisma: TenantPrismaService,
    private readonly aiService: AiService,
  ) {}

  create(dto: CreateRiskDto, userId: string) {
    // organizationId: "" is a placeholder overwritten by the tenant-scoping
    // extension — see the comment in AiUsageService.recordBestEffort.
    return this.prisma.risk.create({ data: { organizationId: "", ...dto, createdById: userId } });
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
