import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SopsService } from "./sops.service";
import { GenerateSopDto } from "./dto/generate-sop.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("sops")
export class SopsController {
  constructor(private readonly sopsService: SopsService) {}

  @Get()
  findAll() {
    return this.sopsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.sopsService.findOne(id);
  }

  @Post("generate")
  generate(@Body() dto: GenerateSopDto, @CurrentUser() user: CurrentUserPayload) {
    return this.sopsService.generate(dto.incidentId, user.id);
  }
}
