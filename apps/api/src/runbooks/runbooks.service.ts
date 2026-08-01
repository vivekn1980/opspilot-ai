import { Injectable, NotFoundException } from "@nestjs/common";
import { Runbook, RunbookRun } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRunbookDto } from "./dto/create-runbook.dto";
import { UpdateStepResultDto } from "./dto/update-step-result.dto";
import { RunbookStep, RunbookStepResult } from "./types";

function withParsedSteps(runbook: Runbook) {
  return { ...runbook, steps: JSON.parse(runbook.steps) as RunbookStep[] };
}

function withParsedResults(run: RunbookRun) {
  return { ...run, stepResults: JSON.parse(run.stepResults) as RunbookStepResult[] };
}

@Injectable()
export class RunbooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRunbookDto) {
    const runbook = await this.prisma.runbook.create({
      data: {
        title: dto.title,
        description: dto.description,
        steps: JSON.stringify(dto.steps),
      },
    });
    return withParsedSteps(runbook);
  }

  async findAll() {
    const runbooks = await this.prisma.runbook.findMany({ orderBy: { createdAt: "desc" } });
    return runbooks.map(withParsedSteps);
  }

  async findOne(id: string) {
    const runbook = await this.prisma.runbook.findUnique({ where: { id } });
    if (!runbook) {
      throw new NotFoundException(`Runbook ${id} not found`);
    }
    return withParsedSteps(runbook);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.runbook.delete({ where: { id } });
  }

  async startRun(runbookId: string) {
    const runbook = await this.findOne(runbookId);
    const stepResults: RunbookStepResult[] = runbook.steps.map((s) => ({
      order: s.order,
      completed: false,
    }));
    const run = await this.prisma.runbookRun.create({
      data: { runbookId, stepResults: JSON.stringify(stepResults) },
    });
    return withParsedResults(run);
  }

  async listRuns(runbookId: string) {
    const runs = await this.prisma.runbookRun.findMany({
      where: { runbookId },
      orderBy: { startedAt: "desc" },
    });
    return runs.map(withParsedResults);
  }

  async getRun(runId: string) {
    const run = await this.prisma.runbookRun.findUnique({ where: { id: runId } });
    if (!run) {
      throw new NotFoundException(`Runbook run ${runId} not found`);
    }
    return withParsedResults(run);
  }

  async updateStepResult(runId: string, dto: UpdateStepResultDto) {
    const run = await this.getRun(runId);
    const stepResults = run.stepResults.map((r) =>
      r.order === dto.order ? { order: dto.order, completed: dto.completed, note: dto.note } : r,
    );
    const allCompleted = stepResults.every((r) => r.completed);

    const updated = await this.prisma.runbookRun.update({
      where: { id: runId },
      data: {
        stepResults: JSON.stringify(stepResults),
        status: allCompleted ? "COMPLETED" : "IN_PROGRESS",
        completedAt: allCompleted ? new Date() : null,
      },
    });
    return withParsedResults(updated);
  }
}
