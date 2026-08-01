import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SEVERITIES, Severity } from "../constants";

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(SEVERITIES)
  @IsOptional()
  severity?: Severity;

  @IsString()
  @IsOptional()
  rawLogs?: string;
}
