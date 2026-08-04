import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { InvitesService } from "./invites.service";
import { CurrentUser, CurrentUserPayload } from "../auth/current-user.decorator";
import { AdminOnly } from "../auth/admin-only.decorator";

@Controller("invites")
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  // POST already requires ADMIN by RolesGuard's default (non-GET) rule.
  @Post()
  create(@CurrentUser() user: CurrentUserPayload) {
    return this.invitesService.create(user.organizationId, user.id);
  }

  // GET is normally open to any authenticated role, but this lists codes
  // that grant access to the org — force the admin check explicitly.
  @AdminOnly()
  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.invitesService.findAll(user.organizationId);
  }

  @Delete(":id")
  revoke(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invitesService.revoke(user.organizationId, id);
  }
}
