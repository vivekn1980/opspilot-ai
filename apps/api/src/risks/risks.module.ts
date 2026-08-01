import { Module } from "@nestjs/common";
import { RisksService } from "./risks.service";
import { RisksController } from "./risks.controller";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [RisksController],
  providers: [RisksService],
})
export class RisksModule {}
