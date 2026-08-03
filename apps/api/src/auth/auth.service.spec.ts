import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

function makeService(overrides: { userCount?: number; existingUser?: any } = {}) {
  const prisma = {
    user: {
      count: jest.fn().mockResolvedValue(overrides.userCount ?? 0),
      findUnique: jest.fn().mockResolvedValue(overrides.existingUser ?? null),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "new-id", ...data })),
    },
  };
  const jwt = { sign: jest.fn().mockReturnValue("signed-token") };
  const service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  return { service, prisma, jwt };
}

describe("AuthService.register", () => {
  it("makes the very first registered user an ADMIN", async () => {
    const { service, prisma } = makeService({ userCount: 0 });

    await service.register({ email: "first@x.com", password: "password123", name: "First" });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "ADMIN" }) }),
    );
  });

  it("makes every subsequent registration a VIEWER by default", async () => {
    const { service, prisma } = makeService({ userCount: 3 });

    await service.register({ email: "later@x.com", password: "password123", name: "Later" });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: "VIEWER" }) }),
    );
  });

  it("rejects registration with an email already in use", async () => {
    const { service } = makeService({ existingUser: { id: "x", email: "dup@x.com" } });

    await expect(
      service.register({ email: "dup@x.com", password: "password123", name: "Dup" }),
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
