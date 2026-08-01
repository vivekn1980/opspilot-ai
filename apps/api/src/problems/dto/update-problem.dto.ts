import { IsIn, IsOptional, IsString } from "class-validator";
import { PROBLEM_STATUSES, ProblemStatus } from "../constants";

export class UpdateProblemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(PROBLEM_STATUSES)
  @IsOptional()
  status?: ProblemStatus;

  @IsString()
  @IsOptional()
  rootCause?: string;
}
