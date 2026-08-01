import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { RunbooksService } from "./runbooks.service";
import { CreateRunbookDto } from "./dto/create-runbook.dto";
import { UpdateStepResultDto } from "./dto/update-step-result.dto";

@Controller("runbooks")
export class RunbooksController {
  constructor(private readonly runbooksService: RunbooksService) {}

  @Post()
  create(@Body() dto: CreateRunbookDto) {
    return this.runbooksService.create(dto);
  }

  @Get()
  findAll() {
    return this.runbooksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.runbooksService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.runbooksService.remove(id);
  }

  @Post(":id/runs")
  startRun(@Param("id") id: string) {
    return this.runbooksService.startRun(id);
  }

  @Get(":id/runs")
  listRuns(@Param("id") id: string) {
    return this.runbooksService.listRuns(id);
  }

  @Get(":id/runs/:runId")
  getRun(@Param("runId") runId: string) {
    return this.runbooksService.getRun(runId);
  }

  @Put(":id/runs/:runId/steps")
  updateStepResult(@Param("runId") runId: string, @Body() dto: UpdateStepResultDto) {
    return this.runbooksService.updateStepResult(runId, dto);
  }
}
