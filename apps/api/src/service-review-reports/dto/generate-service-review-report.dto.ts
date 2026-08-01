import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class GenerateServiceReviewReportDto {
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;
}
