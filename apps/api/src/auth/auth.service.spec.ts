import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

function makeService(overrides: { existingUser?: any; invite?: any } = {}) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(overrides.existingUser ?? null),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "new-user-id", ...data })),
    },
    organization: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "new-org-id", ...data })),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "org-1", name: "Existing Org" }),
    },
    invite: {
      findUnique: jest.fn().mockResolvedValue(overrides.invite ?? null),
      update: jest.fn().mockResolvedValue(undefined),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue("signed-token") };
  const service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  return { service, prisma, jwt };
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

describe("AuthService.register", () => {
  it("creates a new organization and makes the registering user its ADMIN", async () => {
    const { service, prisma } = makeService();

    await service.register({
      email: "founder@x.com",
      password: "password123",
      name: "Founder",
      organizationName: "Acme Corp",
    });

    expect(prisma.organization.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: "Acme Corp" } }),
    );
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "ADMIN", organizationId: "new-org-id" }),
      }),
    );
  });

  it("rejects registration with an email already in use", async () => {
    const { service } = makeService({ existingUser: { id: "x", email: "dup@x.com" } });

    await expect(
      service.register({ email: "dup@x.com", password: "password123", name: "Dup", organizationName: "Dup Co" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe("AuthService.login", () => {
  it("rejects a login for an email that doesn't exist", async () => {
    const { service } = makeService({ existingUser: null });

    await expect(service.login({ email: "nobody@x.com", password: "whatever" })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe("AuthService.acceptInvite", () => {
  it("joins the invite's organization as a VIEWER and marks the invite used", async () => {
    const { service, prisma } = makeService({
      invite: { id: "inv-1", organizationId: "org-1", usedAt: null, expiresAt: hoursFromNow(1) },
    });

    await service.acceptInvite({ code: "abc123", email: "new@x.com", password: "password123", name: "New Guy" });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "VIEWER", organizationId: "org-1" }),
      }),
    );
    expect(prisma.invite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inv-1" },
        data: expect.objectContaining({ usedByUserId: "new-user-id" }),
      }),
    );
  });

  it("rejects an unknown invite code", async () => {
    const { service } = makeService({ invite: null });
    await expect(
      service.acceptInvite({ code: "bogus", email: "x@x.com", password: "password123", name: "X" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects an already-used invite", async () => {
    const { service } = makeService({
      invite: { id: "inv-1", organizationId: "org-1", usedAt: new Date(), expiresAt: hoursFromNow(1) },
    });
    await expect(
      service.acceptInvite({ code: "abc123", email: "x@x.com", password: "password123", name: "X" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects an expired invite", async () => {
    const { service } = makeService({
      invite: { id: "inv-1", organizationId: "org-1", usedAt: null, expiresAt: hoursFromNow(-1) },
    });
    await expect(
      service.acceptInvite({ code: "abc123", email: "x@x.com", password: "password123", name: "X" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a valid invite if the email is already registered", async () => {
    const { service } = makeService({
      invite: { id: "inv-1", organizationId: "org-1", usedAt: null, expiresAt: hoursFromNow(1) },
      existingUser: { id: "existing", email: "dup@x.com" },
    });
    await expect(
      service.acceptInvite({ code: "abc123", email: "dup@x.com", password: "password123", name: "X" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
