import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

function makeService(overrides: { existingUser?: any } = {}) {
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(overrides.existingUser ?? null),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "new-user-id", ...data })),
    },
    organization: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "new-org-id", ...data })),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: "org-1", name: "Existing Org" }),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue("signed-token") };
  const service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  return { service, prisma, jwt };
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
