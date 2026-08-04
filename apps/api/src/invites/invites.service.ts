import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Invite isn't tenant-scoped (see the comment on the Invite model in
// schema.prisma), so every method here filters/verifies organizationId
// explicitly — same pattern as UsersService.
@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  create(organizationId: string, createdById: string) {
    const code = randomBytes(18).toString("base64url");
    return this.prisma.invite.create({
      data: {
        organizationId,
        code,
        createdById,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.invite.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async revoke(organizationId: string, id: string) {
    const invite = await this.prisma.invite.findUnique({ where: { id } });
    if (!invite || invite.organizationId !== organizationId) {
      throw new NotFoundException(`Invite ${id} not found`);
    }
    if (invite.usedAt) {
      throw new BadRequestException("This invite has already been used and can't be revoked");
    }
    await this.prisma.invite.delete({ where: { id } });
    return { ok: true };
  }
}
