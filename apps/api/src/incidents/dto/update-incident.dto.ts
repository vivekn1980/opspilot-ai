import { IsIn, IsOptional, IsString } from "class-validator";
import { INCIDENT_STATUSES, IncidentStatus, SEVERITIES, Severity } from "../constants";

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(SEVERITIES)
  @IsOptional()
  severity?: Severity;

  @IsIn(INCIDENT_STATUSES)
  @IsOptional()
  status?: IncidentStatus;

  @IsString()
  @IsOptional()
  rawLogs?: string;

  @IsString()
  @IsOptional()
  logAnalysis?: string;

  @IsString()
  @IsOptional()
  rcaReport?: string;
}
