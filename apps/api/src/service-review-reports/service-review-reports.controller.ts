import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ServiceReviewReportsService } from "./service-review-reports.service";
import { GenerateServiceReviewReportDto } from "./dto/generate-service-review-report.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

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
  generate(@Body() dto: GenerateServiceReviewReportDto, @CurrentUser() user: CurrentUserPayload) {
    return this.serviceReviewReportsService.generate(dto.accountName, dto.periodStart, dto.periodEnd, user.id);
  }
}
