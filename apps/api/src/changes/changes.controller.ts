import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ChangesService } from "./changes.service";
import { CreateChangeDto } from "./dto/create-change.dto";
import { UpdateChangeDto } from "./dto/update-change.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("changes")
export class ChangesController {
  constructor(private readonly changesService: ChangesService) {}

  @Post()
  create(@Body() dto: CreateChangeDto, @CurrentUser() user: CurrentUserPayload) {
    return this.changesService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.changesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.changesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateChangeDto) {
    return this.changesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.changesService.remove(id);
  }
}
