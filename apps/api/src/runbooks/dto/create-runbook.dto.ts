import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class RunbookStepDto {
  @IsInt()
  order!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  command?: string;
}

export class CreateRunbookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @ValidateNested({ each: true })
  @Type(() => RunbookStepDto)
  @ArrayMinSize(1)
  steps!: RunbookStepDto[];
}
