import { Module } from "@nestjs/common";
import { CapacityService } from "./capacity.service";
import { CapacityController } from "./capacity.controller";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [CapacityController],
  providers: [CapacityService],
})
export class CapacityModule {}
