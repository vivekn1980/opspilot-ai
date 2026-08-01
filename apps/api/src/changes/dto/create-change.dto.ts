import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CHANGE_STATUSES, ChangeStatus, RISK_LEVELS, RiskLevel } from "../constants";

export class CreateChangeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(RISK_LEVELS)
  @IsOptional()
  riskLevel?: RiskLevel;

  @IsIn(CHANGE_STATUSES)
  @IsOptional()
  status?: ChangeStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
