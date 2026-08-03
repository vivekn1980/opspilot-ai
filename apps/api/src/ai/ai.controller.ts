import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { AiService } from "./ai.service";
import { IncidentsService } from "../incidents/incidents.service";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

class AnalyzeLogsDto {
  @IsString()
  @IsOptional()
  rawLogs?: string;
}

@Controller("incidents/:id")
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly incidentsService: IncidentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post("analyze-logs")
  async analyzeLogs(@Param("id") id: string, @Body() dto: AnalyzeLogsDto) {
    const incident = await this.incidentsService.findOne(id);
    const rawLogs = dto.rawLogs ?? incident.rawLogs;
    if (!rawLogs) {
      return { error: "No logs provided or stored on this incident." };
    }
    const logAnalysis = await this.aiService.analyzeLogs(rawLogs);
    return this.incidentsService.update(id, { rawLogs, logAnalysis });
  }

  @Post("generate-rca")
  async generateRca(@Param("id") id: string) {
    const incident = await this.incidentsService.findOne(id);
    const rcaReport = await this.aiService.generateRca({
      title: incident.title,
      description: incident.description,
      logAnalysis: incident.logAnalysis,
    });
    return this.incidentsService.update(id, { rcaReport });
  }

  @Get("customer-updates")
  listCustomerUpdates(@Param("id") id: string) {
    return this.prisma.customerUpdate.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: "asc" },
    });
  }

  @Post("customer-updates/generate")
  async generateCustomerUpdate(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    const incident = await this.incidentsService.findOne(id);
    const priorUpdates = await this.prisma.customerUpdate.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: "asc" },
    });
    const content = await this.aiService.generateCustomerUpdate({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      priorUpdates: priorUpdates.map((u) => u.content),
    });
    return this.prisma.customerUpdate.create({ data: { incidentId: id, content, createdById: user.id } });
  }
}
