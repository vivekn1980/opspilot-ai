import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { PrismaService } from "../prisma/prisma.service";

function makeContext(method: string, user: { id: string } | undefined) {
  const request = { method, user };
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function makeGuard(metadata: Record<string, boolean | undefined>, role: string | null) {
  const reflector = {
    getAllAndOverride: jest.fn((key: string) => metadata[key]),
  };
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(role ? { id: "u1", role } : null),
    },
  };
  const guard = new RolesGuard(reflector as unknown as Reflector, prisma as unknown as PrismaService);
  return guard;
}

describe("RolesGuard", () => {
  it("allows a @Public() route through with no user at all", async () => {
    const guard = makeGuard({ isPublic: true }, null);
    await expect(guard.canActivate(makeContext("POST", undefined))).resolves.toBe(true);
  });

  it("allows a GET request for a VIEWER", async () => {
    const guard = makeGuard({ isPublic: undefined, adminOnly: undefined }, "VIEWER");
    await expect(guard.canActivate(makeContext("GET", { id: "u1" }))).resolves.toBe(true);
  });

  it("rejects a POST request from a VIEWER with ForbiddenException", async () => {
    const guard = makeGuard({ isPublic: undefined, adminOnly: undefined }, "VIEWER");
    await expect(guard.canActivate(makeContext("POST", { id: "u1" }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows a POST request from an ADMIN", async () => {
    const guard = makeGuard({ isPublic: undefined, adminOnly: undefined }, "ADMIN");
    await expect(guard.canActivate(makeContext("POST", { id: "u1" }))).resolves.toBe(true);
  });

  it("forces the admin check on a GET route marked @AdminOnly() even for a VIEWER", async () => {
    const guard = makeGuard({ isPublic: undefined, adminOnly: true }, "VIEWER");
    await expect(guard.canActivate(makeContext("GET", { id: "u1" }))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws UnauthorizedException if the request has no user at all on a protected route", async () => {
    const guard = makeGuard({ isPublic: undefined, adminOnly: undefined }, null);
    await expect(guard.canActivate(makeContext("POST", undefined))).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
