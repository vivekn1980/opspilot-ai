import { IsNotEmpty, IsString } from "class-validator";

export class AskMonitoringDto {
  @IsString()
  @IsNotEmpty()
  question!: string;
}
