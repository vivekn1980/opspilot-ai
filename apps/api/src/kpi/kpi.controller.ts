import { Controller, Get } from "@nestjs/common";
import { KpiService } from "./kpi.service";

@Controller("kpi")
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get()
  getSummary() {
    return this.kpiService.getSummary();
  }
}
