import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RISK_LEVELS, RISK_STATUSES, RiskLevel, RiskStatus } from "../constants";

export class CreateRiskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(RISK_LEVELS)
  @IsOptional()
  likelihood?: RiskLevel;

  @IsIn(RISK_LEVELS)
  @IsOptional()
  impact?: RiskLevel;

  @IsIn(RISK_STATUSES)
  @IsOptional()
  status?: RiskStatus;
}
