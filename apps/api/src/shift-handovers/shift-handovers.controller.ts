import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ShiftHandoversService } from "./shift-handovers.service";
import { GenerateShiftHandoverDto } from "./dto/generate-shift-handover.dto";

@Controller("shift-handovers")
export class ShiftHandoversController {
  constructor(private readonly shiftHandoversService: ShiftHandoversService) {}

  @Get()
  findAll() {
    return this.shiftHandoversService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.shiftHandoversService.findOne(id);
  }

  @Post("generate")
  generate(@Body() dto: GenerateShiftHandoverDto) {
    return this.shiftHandoversService.generate(dto.periodStart, dto.periodEnd);
  }
}
