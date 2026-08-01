import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateIncidentDto) {
    return this.prisma.incident.create({ data: dto });
  }

  findAll() {
    return this.prisma.incident.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    await this.findOne(id);
    return this.prisma.incident.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.incident.delete({ where: { id } });
  }
}
