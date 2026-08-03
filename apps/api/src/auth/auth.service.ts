import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    // Bootstrap: the very first account has no one to grant it admin, so it
    // grants itself. Every registration after that starts as VIEWER.
    const isFirstUser = (await this.prisma.user.count()) === 0;
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name, role: isFirstUser ? "ADMIN" : "VIEWER" },
    });
    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return this.buildAuthResult(user);
  }

  // Used by GET /auth/me — deliberately re-reads from the DB rather than
  // trusting the JWT payload, so a role change (or account deletion) takes
  // effect on the user's next load instead of waiting out the token's TTL.
  async getUserById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private buildAuthResult(user: { id: string; email: string; name: string; role: string }): AuthResult {
    const token = this.jwtService.sign({ sub: user.id, email: user.email, name: user.name });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }
}
