import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ExecutiveReportsService } from "./executive-reports.service";
import { GenerateExecutiveReportDto } from "./dto/generate-executive-report.dto";

@Controller("executive-reports")
export class ExecutiveReportsController {
  constructor(private readonly executiveReportsService: ExecutiveReportsService) {}

  @Get()
  findAll() {
    return this.executiveReportsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.executiveReportsService.findOne(id);
  }

  @Post("generate")
  generate(@Body() dto: GenerateExecutiveReportDto) {
    return this.executiveReportsService.generate(dto.periodStart, dto.periodEnd);
  }
}
