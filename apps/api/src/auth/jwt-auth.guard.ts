import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { AUTH_COOKIE_NAME } from "./constants";
import { tenantContext } from "../prisma/tenant-context";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  organizationId: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedException("Not authenticated");
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      // Normalized to { id, email, name, organizationId } for controller consumers.
      (request as any).user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        organizationId: payload.organizationId,
      };
      // Sets the tenant context for the rest of this request's async
      // continuation — enterWith (vs. .run(callback)) is what lets a guard,
      // which returns a plain boolean rather than wrapping downstream
      // execution, still propagate the context into the controller/service
      // calls that happen after it.
      tenantContext.enterWith({ organizationId: payload.organizationId });
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
