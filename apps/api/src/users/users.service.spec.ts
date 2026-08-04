import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

const ORG_ID = "org-1";

function makeService(user: { id: string; role: string; organizationId?: string } | null, adminCount: number) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user ? { organizationId: ORG_ID, ...user } : null),
      count: jest.fn().mockResolvedValue(adminCount),
      update: jest.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      findMany: jest.fn(),
    },
  };
  return { service: new UsersService(prisma as unknown as PrismaService), prisma };
}

describe("UsersService.updateRole", () => {
  it("refuses to demote the last remaining admin", async () => {
    const { service } = makeService({ id: "u1", role: "ADMIN" }, 1);
    await expect(service.updateRole(ORG_ID, "u1", "VIEWER")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("allows demoting an admin when another admin still exists", async () => {
    const { service, prisma } = makeService({ id: "u1", role: "ADMIN" }, 2);
    await service.updateRole(ORG_ID, "u1", "VIEWER");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" }, data: { role: "VIEWER" } }),
    );
  });

  it("allows promoting a viewer without checking admin count", async () => {
    const { service, prisma } = makeService({ id: "u2", role: "VIEWER" }, 1);
    await service.updateRole(ORG_ID, "u2", "ADMIN");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u2" }, data: { role: "ADMIN" } }),
    );
  });

  it("throws NotFoundException for a nonexistent user", async () => {
    const { service } = makeService(null, 1);
    await expect(service.updateRole(ORG_ID, "missing", "ADMIN")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFoundException when the target user belongs to a different organization", async () => {
    const { service } = makeService({ id: "u3", role: "VIEWER", organizationId: "other-org" }, 1);
    await expect(service.updateRole(ORG_ID, "u3", "ADMIN")).rejects.toBeInstanceOf(NotFoundException);
  });
});
