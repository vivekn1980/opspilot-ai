import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { IncidentsService } from "../incidents/incidents.service";

@Injectable()
export class SopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly incidentsService: IncidentsService,
  ) {}

  findAll() {
    return this.prisma.sop.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const sop = await this.prisma.sop.findUnique({ where: { id } });
    if (!sop) {
      throw new NotFoundException(`SOP ${id} not found`);
    }
    return sop;
  }

  async generate(incidentId: string, userId: string) {
    const incident = await this.incidentsService.findOne(incidentId);
    const content = await this.aiService.generateSop({
      title: incident.title,
      description: incident.description,
      logAnalysis: incident.logAnalysis,
      rcaReport: incident.rcaReport,
    });
    return this.prisma.sop.create({
      data: {
        title: `SOP: ${incident.title}`,
        content,
        sourceIncidentId: incident.id,
        createdById: userId,
      },
    });
  }
}
