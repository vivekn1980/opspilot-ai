import { IsIn, IsOptional, IsString } from "class-validator";
import { RISK_LEVELS, RISK_STATUSES, RiskLevel, RiskStatus } from "../constants";

export class UpdateRiskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(RISK_LEVELS)
  @IsOptional()
  likelihood?: RiskLevel;

  @IsIn(RISK_LEVELS)
  @IsOptional()
  impact?: RiskLevel;

  @IsIn(RISK_STATUSES)
  @IsOptional()
  status?: RiskStatus;

  @IsString()
  @IsOptional()
  mitigation?: string;
}
