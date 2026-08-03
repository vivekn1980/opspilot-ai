import { IsIn } from "class-validator";

export const ROLES = ["ADMIN", "VIEWER"] as const;

export class UpdateRoleDto {
  @IsIn(ROLES)
  role!: (typeof ROLES)[number];
}
