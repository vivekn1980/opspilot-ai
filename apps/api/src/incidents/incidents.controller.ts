import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { IncidentsService } from "./incidents.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";

@Controller("incidents")
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.incidentsService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.incidentsService.remove(id);
  }
}
