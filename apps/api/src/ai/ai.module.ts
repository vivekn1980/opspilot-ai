import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { IncidentsModule } from "../incidents/incidents.module";

@Module({
  imports: [IncidentsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
