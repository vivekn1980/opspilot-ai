import { Injectable, NotFoundException } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: TenantPrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateIncidentDto, userId: string) {
    // organizationId: "" is a placeholder overwritten by the tenant-scoping
    // extension — see the comment in AiUsageService.recordBestEffort.
    const incident = await this.prisma.incident.create({
      data: { organizationId: "", ...dto, createdById: userId },
    });
    if (incident.severity === "SEV1") {
      this.notifications.notifyBestEffort(`🚨 New SEV1 incident: "${incident.title}" (ID: ${incident.id})`);
    }
    return incident;
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
