import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { IncidentsModule } from "../incidents/incidents.module";
import { SettingsModule } from "../settings/settings.module";
import { AiUsageModule } from "../ai-usage/ai-usage.module";

@Module({
  imports: [IncidentsModule, SettingsModule, AiUsageModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
