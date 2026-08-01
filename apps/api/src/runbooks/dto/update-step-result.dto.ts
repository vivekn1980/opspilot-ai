import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateStepResultDto {
  @IsInt()
  order!: number;

  @IsBoolean()
  completed!: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}
