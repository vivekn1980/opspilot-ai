import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AdminOnly } from "../auth/admin-only.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET is normally open to any authenticated role, but this one lists every
  // account's email — force the admin check explicitly.
  @AdminOnly()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // PATCH already requires ADMIN by RolesGuard's default (non-GET) rule.
  @Patch(":id/role")
  updateRole(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }
}
