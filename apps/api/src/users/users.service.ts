import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const USER_SELECT = { id: true, email: true, name: true, role: true, createdAt: true } as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: USER_SELECT, orderBy: { createdAt: "asc" } });
  }

  async updateRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await this.prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new BadRequestException("Can't demote the last remaining admin");
      }
    }

    return this.prisma.user.update({ where: { id }, data: { role }, select: USER_SELECT });
  }
}
