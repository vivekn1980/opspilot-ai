import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ServiceReviewReportsService } from "./service-review-reports.service";
import { GenerateServiceReviewReportDto } from "./dto/generate-service-review-report.dto";

@Controller("service-review-reports")
export class ServiceReviewReportsController {
  constructor(private readonly serviceReviewReportsService: ServiceReviewReportsService) {}

  @Get()
  findAll() {
    return this.serviceReviewReportsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serviceReviewReportsService.findOne(id);
  }

  @Post("generate")
  generate(@Body() dto: GenerateServiceReviewReportDto) {
    return this.serviceReviewReportsService.generate(dto.accountName, dto.periodStart, dto.periodEnd);
  }
}
