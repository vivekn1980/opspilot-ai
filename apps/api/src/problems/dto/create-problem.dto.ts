import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PROBLEM_STATUSES, ProblemStatus } from "../constants";

export class CreateProblemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(PROBLEM_STATUSES)
  @IsOptional()
  status?: ProblemStatus;

  @IsString()
  @IsOptional()
  rootCause?: string;
}
