import { BadRequestException, NotFoundException } from "@nestjs/common";
import { InvitesService } from "./invites.service";
import { PrismaService } from "../prisma/prisma.service";

const ORG_ID = "org-1";

function makeService(invite: { id: string; organizationId: string; usedAt: Date | null } | null) {
  const prisma = {
    invite: {
      findUnique: jest.fn().mockResolvedValue(invite),
      delete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { service: new InvitesService(prisma as unknown as PrismaService), prisma };
}

describe("InvitesService.revoke", () => {
  it("deletes an unused invite belonging to the caller's org", async () => {
    const { service, prisma } = makeService({ id: "inv-1", organizationId: ORG_ID, usedAt: null });
    const result = await service.revoke(ORG_ID, "inv-1");
    expect(prisma.invite.delete).toHaveBeenCalledWith({ where: { id: "inv-1" } });
    expect(result).toEqual({ ok: true });
  });

  it("refuses to revoke an already-used invite", async () => {
    const { service } = makeService({ id: "inv-1", organizationId: ORG_ID, usedAt: new Date() });
    await expect(service.revoke(ORG_ID, "inv-1")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws NotFoundException for an invite belonging to a different organization", async () => {
    const { service } = makeService({ id: "inv-1", organizationId: "other-org", usedAt: null });
    await expect(service.revoke(ORG_ID, "inv-1")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException for a nonexistent invite", async () => {
    const { service } = makeService(null);
    await expect(service.revoke(ORG_ID, "missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
