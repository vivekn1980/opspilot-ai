import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { IncidentsModule } from "./incidents/incidents.module";
import { AiModule } from "./ai/ai.module";
import { ProblemsModule } from "./problems/problems.module";
import { ChangesModule } from "./changes/changes.module";
import { SopsModule } from "./sops/sops.module";
import { DocsModule } from "./docs/docs.module";
import { ShiftHandoversModule } from "./shift-handovers/shift-handovers.module";
import { KpiModule } from "./kpi/kpi.module";
import { RisksModule } from "./risks/risks.module";
import { CapacityModule } from "./capacity/capacity.module";
import { RunbooksModule } from "./runbooks/runbooks.module";
import { ExecutiveReportsModule } from "./executive-reports/executive-reports.module";
import { ServiceReviewReportsModule } from "./service-review-reports/service-review-reports.module";
import { SettingsModule } from "./settings/settings.module";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { SearchModule } from "./search/search.module";

@Module({
  imports: [
    PrismaModule,
    IncidentsModule,
    AiModule,
    SettingsModule,
    ProblemsModule,
    ChangesModule,
    SopsModule,
    DocsModule,
    ShiftHandoversModule,
    KpiModule,
    RisksModule,
    CapacityModule,
    RunbooksModule,
    ExecutiveReportsModule,
    ServiceReviewReportsModule,
    MonitoringModule,
    NotificationsModule,
    SearchModule,
  ],
})
export class AppModule {}
