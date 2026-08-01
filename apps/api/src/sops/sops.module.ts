import { Module } from "@nestjs/common";
import { SopsService } from "./sops.service";
import { SopsController } from "./sops.controller";
import { AiModule } from "../ai/ai.module";
import { IncidentsModule } from "../incidents/incidents.module";

@Module({
  imports: [AiModule, IncidentsModule],
  controllers: [SopsController],
  providers: [SopsService],
})
export class SopsModule {}
