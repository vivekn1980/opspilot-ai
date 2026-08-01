import { Body, Controller, Param, Post } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { AiService } from "./ai.service";
import { IncidentsService } from "../incidents/incidents.service";

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
}
