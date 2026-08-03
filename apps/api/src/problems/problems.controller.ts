import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ProblemsService } from "./problems.service";
import { CreateProblemDto } from "./dto/create-problem.dto";
import { UpdateProblemDto } from "./dto/update-problem.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("problems")
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  create(@Body() dto: CreateProblemDto, @CurrentUser() user: CurrentUserPayload) {
    return this.problemsService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.problemsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.problemsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProblemDto) {
    return this.problemsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.problemsService.remove(id);
  }
}
