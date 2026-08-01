import { Module } from "@nestjs/common";
import { ExecutiveReportsService } from "./executive-reports.service";
import { ExecutiveReportsController } from "./executive-reports.controller";
import { AiModule } from "../ai/ai.module";
import { KpiModule } from "../kpi/kpi.module";

@Module({
  imports: [AiModule, KpiModule],
  controllers: [ExecutiveReportsController],
  providers: [ExecutiveReportsService],
})
export class ExecutiveReportsModule {}
