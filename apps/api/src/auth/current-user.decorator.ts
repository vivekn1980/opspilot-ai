import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface CurrentUserPayload {
  id: string;
  email: string;
  name: string;
  organizationId: string;
}

// Reads the user JwtAuthGuard attached to the request — only valid on
// routes that aren't @Public(), since that's the only place it's set.
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
