import { KpiService } from "./kpi.service";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";

function incident(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "id-1",
    severity: "SEV3",
    status: "OPEN",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

describe("KpiService.getSummary", () => {
  function makeService(incidents: unknown[]) {
    const prisma = { incident: { findMany: jest.fn().mockResolvedValue(incidents) } };
    return new KpiService(prisma as unknown as TenantPrismaService);
  }

  it("counts incidents by severity and status", async () => {
    const service = makeService([
      incident({ severity: "SEV1", status: "OPEN" }),
      incident({ severity: "SEV1", status: "RESOLVED" }),
      incident({ severity: "SEV3", status: "INVESTIGATING" }),
    ]);

    const summary = await service.getSummary();

    expect(summary.totalIncidents).toBe(3);
    expect(summary.countsBySeverity.SEV1).toBe(2);
    expect(summary.countsBySeverity.SEV3).toBe(1);
    expect(summary.countsByStatus.OPEN).toBe(1);
    expect(summary.countsByStatus.RESOLVED).toBe(1);
    expect(summary.openIncidents).toBe(2); // total minus RESOLVED/CLOSED
  });

  it("flags an open incident past its severity's SLA target as a breach", async () => {
    const service = makeService([
      // SEV1 target is 4h — 10h old and still open is a breach.
      incident({ severity: "SEV1", status: "OPEN", createdAt: hoursAgo(10) }),
      // SEV4 target is 72h — 10h old is well within target.
      incident({ severity: "SEV4", status: "OPEN", createdAt: hoursAgo(10) }),
    ]);

    const summary = await service.getSummary();

    expect(summary.slaBreaches).toBe(1);
  });

  it("does not count a resolved incident as an SLA breach even if old", async () => {
    const service = makeService([
      incident({ severity: "SEV1", status: "RESOLVED", createdAt: hoursAgo(100) }),
    ]);

    const summary = await service.getSummary();

    expect(summary.slaBreaches).toBe(0);
  });

  it("computes MTTR only from resolved/closed incidents", async () => {
    const resolvedCreated = hoursAgo(10);
    const resolvedUpdated = hoursAgo(4); // resolved 6h after creation
    const service = makeService([
      incident({
        severity: "SEV2",
        status: "RESOLVED",
        createdAt: resolvedCreated,
        updatedAt: resolvedUpdated,
      }),
      incident({ severity: "SEV2", status: "OPEN", createdAt: hoursAgo(1) }),
    ]);

    const summary = await service.getSummary();

    expect(summary.mttrHours).not.toBeNull();
    expect(summary.mttrHours as number).toBeCloseTo(6, 1);
  });

  it("returns null MTTR when there are no resolved incidents", async () => {
    const service = makeService([incident({ severity: "SEV2", status: "OPEN" })]);

    const summary = await service.getSummary();

    expect(summary.mttrHours).toBeNull();
  });
});
