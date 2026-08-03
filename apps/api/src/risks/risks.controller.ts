import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { RisksService } from "./risks.service";
import { CreateRiskDto } from "./dto/create-risk.dto";
import { UpdateRiskDto } from "./dto/update-risk.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("risks")
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Post()
  create(@Body() dto: CreateRiskDto, @CurrentUser() user: CurrentUserPayload) {
    return this.risksService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.risksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.risksService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateRiskDto) {
    return this.risksService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.risksService.remove(id);
  }

  @Post(":id/generate-mitigation")
  generateMitigation(@Param("id") id: string) {
    return this.risksService.generateMitigation(id);
  }
}
