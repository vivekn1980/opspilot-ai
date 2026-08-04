import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { UsersModule } from "./users/users.module";
import { InvitesModule } from "./invites/invites.module";
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
import { AiUsageModule } from "./ai-usage/ai-usage.module";
import { IntegrationsModule } from "./integrations/integrations.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
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
    AiUsageModule,
    UsersModule,
    InvitesModule,
    IntegrationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
