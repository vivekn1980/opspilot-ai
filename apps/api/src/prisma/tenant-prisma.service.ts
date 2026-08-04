import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { withTenantScoping } from "./tenant-scoping.extension";

function buildExtendedClient() {
  return new PrismaClient().$extends(withTenantScoping());
}

type ExtendedClient = ReturnType<typeof buildExtendedClient>;

// Injected by every service that touches a tenant-scoped model (see
// TENANT_SCOPED_MODELS in tenant-scoping.extension.ts) instead of the raw
// PrismaService. Every property below is a plain passthrough to the
// extended client — the extension does the actual organizationId
// injection, this class exists only so call sites read exactly like the
// raw PrismaService (this.prisma.incident.findMany(...)) with no other
// code changes needed.
@Injectable()
export class TenantPrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: ExtendedClient = buildExtendedClient();

  get incident() {
    return this.client.incident;
  }
  get problem() {
    return this.client.problem;
  }
  get change() {
    return this.client.change;
  }
  get sop() {
    return this.client.sop;
  }
  get doc() {
    return this.client.doc;
  }
  get shiftHandover() {
    return this.client.shiftHandover;
  }
  get customerUpdate() {
    return this.client.customerUpdate;
  }
  get risk() {
    return this.client.risk;
  }
  get capacityReport() {
    return this.client.capacityReport;
  }
  get runbook() {
    return this.client.runbook;
  }
  get runbookRun() {
    return this.client.runbookRun;
  }
  get executiveReport() {
    return this.client.executiveReport;
  }
  get serviceReviewReport() {
    return this.client.serviceReviewReport;
  }
  get metric() {
    return this.client.metric;
  }
  get aiUsageLog() {
    return this.client.aiUsageLog;
  }
  get appSetting() {
    return this.client.appSetting;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
