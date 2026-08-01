import { IsNotEmpty, IsString } from "class-validator";

export class GenerateSopDto {
  @IsString()
  @IsNotEmpty()
  incidentId!: string;
}
