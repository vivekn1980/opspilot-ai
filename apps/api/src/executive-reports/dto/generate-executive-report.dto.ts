import { IsDateString } from "class-validator";

export class GenerateExecutiveReportDto {
  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;
}
