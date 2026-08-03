import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChangeDto } from "./dto/create-change.dto";
import { UpdateChangeDto } from "./dto/update-change.dto";

@Injectable()
export class ChangesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateChangeDto, userId: string) {
    const { scheduledAt, ...rest } = dto;
    return this.prisma.change.create({
      data: { ...rest, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined, createdById: userId },
    });
  }

  findAll() {
    return this.prisma.change.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const change = await this.prisma.change.findUnique({ where: { id } });
    if (!change) {
      throw new NotFoundException(`Change ${id} not found`);
    }
    return change;
  }

  async update(id: string, dto: UpdateChangeDto) {
    await this.findOne(id);
    const { scheduledAt, ...rest } = dto;
    return this.prisma.change.update({
      where: { id },
      data: { ...rest, ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.change.delete({ where: { id } });
  }
}
