import { Body, Controller, Get, HttpCode, Post, Res, UnauthorizedException } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./public.decorator";
import { CurrentUser, CurrentUserPayload } from "./current-user.decorator";
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME } from "./constants";

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  });
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    setAuthCookie(res, result.token);
    return { user: result.user };
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    setAuthCookie(res, result.token);
    return { user: result.user };
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME);
    return { ok: true };
  }

  @Get("me")
  async me(@CurrentUser() user: CurrentUserPayload) {
    const fresh = await this.authService.getUserById(user.id);
    if (!fresh) throw new UnauthorizedException();
    return { user: fresh };
  }
}
