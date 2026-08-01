import { IsDateString } from "class-validator";

export class GenerateShiftHandoverDto {
  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;
}
