import { IsNotEmpty, IsString } from "class-validator";

export class CreateDocDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
