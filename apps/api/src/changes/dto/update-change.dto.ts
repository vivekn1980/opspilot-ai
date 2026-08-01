import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
import { CHANGE_STATUSES, ChangeStatus, RISK_LEVELS, RiskLevel } from "../constants";

export class UpdateChangeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

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
