import { IsNotEmpty, IsString } from "class-validator";

export class CreateMetricDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  rawData!: string;
}
