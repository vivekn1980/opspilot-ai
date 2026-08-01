import { Module } from "@nestjs/common";
import { DocsService } from "./docs.service";
import { DocsController } from "./docs.controller";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AiModule],
  controllers: [DocsController],
  providers: [DocsService],
})
export class DocsModule {}
