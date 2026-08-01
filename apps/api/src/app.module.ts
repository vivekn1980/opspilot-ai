import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { IncidentsModule } from "./incidents/incidents.module";
import { AiModule } from "./ai/ai.module";
import { ProblemsModule } from "./problems/problems.module";
import { ChangesModule } from "./changes/changes.module";
import { SopsModule } from "./sops/sops.module";
import { DocsModule } from "./docs/docs.module";
import { ShiftHandoversModule } from "./shift-handovers/shift-handovers.module";

@Module({
  imports: [
    PrismaModule,
    IncidentsModule,
    AiModule,
    ProblemsModule,
    ChangesModule,
    SopsModule,
    DocsModule,
    ShiftHandoversModule,
  ],
})
export class AppModule {}
