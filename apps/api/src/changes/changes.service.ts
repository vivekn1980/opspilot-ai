import { Injectable, NotFoundException } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { CreateChangeDto } from "./dto/create-change.dto";
import { UpdateChangeDto } from "./dto/update-change.dto";

@Injectable()
export class ChangesService {
  constructor(private readonly prisma: TenantPrismaService) {}

  create(dto: CreateChangeDto, userId: string) {
    const { scheduledAt, ...rest } = dto;
    // organizationId: "" is a placeholder overwritten by the tenant-scoping
    // extension — see the comment in AiUsageService.recordBestEffort.
    return this.prisma.change.create({
      data: {
        organizationId: "",
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdById: userId,
      },
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
