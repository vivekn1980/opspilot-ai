import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { MonitoringService } from "./monitoring.service";
import { CreateMetricDto } from "./dto/create-metric.dto";
import { AskMonitoringDto } from "./dto/ask-monitoring.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("metrics")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post()
  create(@Body() dto: CreateMetricDto, @CurrentUser() user: CurrentUserPayload) {
    return this.monitoringService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.monitoringService.findAll();
  }

  @Post("ask")
  ask(@Body() dto: AskMonitoringDto) {
    return this.monitoringService.ask(dto.question);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.monitoringService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.monitoringService.remove(id);
  }
}
