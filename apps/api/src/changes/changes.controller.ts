import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ChangesService } from "./changes.service";
import { CreateChangeDto } from "./dto/create-change.dto";
import { UpdateChangeDto } from "./dto/update-change.dto";

@Controller("changes")
export class ChangesController {
  constructor(private readonly changesService: ChangesService) {}

  @Post()
  create(@Body() dto: CreateChangeDto) {
    return this.changesService.create(dto);
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
