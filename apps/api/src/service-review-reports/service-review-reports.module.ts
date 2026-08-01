import { Module } from "@nestjs/common";
import { ServiceReviewReportsService } from "./service-review-reports.service";
import { ServiceReviewReportsController } from "./service-review-reports.controller";
import { AiModule } from "../ai/ai.module";
import { KpiModule } from "../kpi/kpi.module";

@Module({
  imports: [AiModule, KpiModule],
  controllers: [ServiceReviewReportsController],
  providers: [ServiceReviewReportsService],
})
export class ServiceReviewReportsModule {}
