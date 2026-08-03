import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { ADMIN_ONLY_KEY } from "./admin-only.decorator";

// Runs after JwtAuthGuard, which has already populated request.user for any
// non-@Public() route. Reads (GET) are open to any authenticated role;
// writes (POST/PATCH/PUT/DELETE) require ADMIN by default. @AdminOnly()
// forces the admin check on a GET route too (e.g. the user list).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const forceAdminCheck = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (request.method === "GET" && !forceAdminCheck) return true;

    const userId = (request as any).user?.id;
    if (!userId) throw new UnauthorizedException();

    // Deliberately re-read the role from the DB rather than trusting the
    // JWT payload — a demotion must take effect on the user's very next
    // request, not after their existing token expires (up to 7 days).
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (user.role !== "ADMIN") {
      throw new ForbiddenException(
        "Viewers can't create, edit, delete, or generate content — ask an admin to promote your account.",
      );
    }
    return true;
  }
}
