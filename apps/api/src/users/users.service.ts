import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const USER_SELECT = { id: true, email: true, name: true, role: true, createdAt: true } as const;

// User isn't covered by the tenant-scoping Prisma extension (see the
// comment on the User model in schema.prisma), so every method here
// filters by organizationId explicitly — an admin must only ever see or
// modify accounts within their own organization.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: USER_SELECT,
      orderBy: { createdAt: "asc" },
    });
  }

  async updateRole(organizationId: string, id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await this.prisma.user.count({ where: { organizationId, role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new BadRequestException("Can't demote the last remaining admin");
      }
    }

    return this.prisma.user.update({ where: { id }, data: { role }, select: USER_SELECT });
  }
}
