import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CapacityService } from "./capacity.service";
import { GenerateCapacityReportDto } from "./dto/generate-capacity-report.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("capacity-reports")
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Get()
  findAll() {
    return this.capacityService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.capacityService.findOne(id);
  }

  @Post("generate")
  generate(@Body() dto: GenerateCapacityReportDto, @CurrentUser() user: CurrentUserPayload) {
    return this.capacityService.generate(dto.metricName, dto.rawData, user.id);
  }
}
