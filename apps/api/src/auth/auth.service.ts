import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const SALT_ROUNDS = 10;

export interface AuthOrganization {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organization: AuthOrganization;
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

  // Every registration creates its own brand-new organization and becomes
  // its founding (and, for now, only) ADMIN — there's no invite-a-teammate
  // flow yet, so there's no existing org for a new account to join.
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const organization = await this.prisma.organization.create({ data: { name: dto.organizationName } });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: "ADMIN",
        organizationId: organization.id,
      },
    });
    return this.buildAuthResult(user, organization);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return this.buildAuthResult(user, organization);
  }

  // Used by GET /auth/me — deliberately re-reads from the DB rather than
  // trusting the JWT payload, so a role change (or account deletion) takes
  // effect on the user's next load instead of waiting out the token's TTL.
  async getUserById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    });
    return this.toAuthUser(user, organization);
  }

  private toAuthUser(
    user: { id: string; email: string; name: string; role: string; organizationId: string },
    organization: AuthOrganization,
  ): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: { id: organization.id, name: organization.name },
    };
  }

  private buildAuthResult(
    user: { id: string; email: string; name: string; role: string; organizationId: string },
    organization: AuthOrganization,
  ): AuthResult {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
    });
    return { user: this.toAuthUser(user, organization), token };
  }
}
