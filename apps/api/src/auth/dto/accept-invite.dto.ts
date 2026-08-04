import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class AcceptInviteDto {
  @IsNotEmpty()
  code!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  name!: string;
}
