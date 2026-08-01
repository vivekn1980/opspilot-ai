import { Module } from "@nestjs/common";
import { ShiftHandoversService } from "./shift-handovers.service";
import { ShiftHandoversController } from "./shift-handovers.controller";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [ShiftHandoversController],
  providers: [ShiftHandoversService],
})
export class ShiftHandoversModule {}
