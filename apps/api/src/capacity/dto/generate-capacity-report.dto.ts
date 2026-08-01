import { IsNotEmpty, IsString } from "class-validator";

export class GenerateCapacityReportDto {
  @IsString()
  @IsNotEmpty()
  metricName!: string;

  @IsString()
  @IsNotEmpty()
  rawData!: string;
}
