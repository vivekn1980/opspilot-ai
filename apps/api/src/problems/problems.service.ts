import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProblemDto } from "./dto/create-problem.dto";
import { UpdateProblemDto } from "./dto/update-problem.dto";

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProblemDto, userId: string) {
    return this.prisma.problem.create({ data: { ...dto, createdById: userId } });
  }

  findAll() {
    return this.prisma.problem.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new NotFoundException(`Problem ${id} not found`);
    }
    return problem;
  }

  async update(id: string, dto: UpdateProblemDto) {
    await this.findOne(id);
    return this.prisma.problem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.problem.delete({ where: { id } });
  }
}
