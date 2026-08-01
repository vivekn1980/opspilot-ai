import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { IncidentsModule } from "./incidents/incidents.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [PrismaModule, IncidentsModule, AiModule],
})
export class AppModule {}
