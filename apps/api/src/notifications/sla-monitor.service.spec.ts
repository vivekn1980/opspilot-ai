import { SlaMonitorService } from "./sla-monitor.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "./notifications.service";

function incident(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "id-1",
    title: "Test incident",
    severity: "SEV3",
    status: "OPEN",
    createdAt: new Date(),
    slaBreachNotifiedAt: null,
    ...overrides,
  };
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

describe("SlaMonitorService.checkForBreaches", () => {
  function makeService(candidates: unknown[]) {
    const prisma = {
      incident: {
        findMany: jest.fn().mockResolvedValue(candidates),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const notifications = { notifyBestEffort: jest.fn() };
    const service = new SlaMonitorService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
    );
    return { service, prisma, notifications };
  }

  it("notifies and marks an incident that has crossed its SLA target", async () => {
    const breached = incident({ id: "breach-1", severity: "SEV1", createdAt: hoursAgo(10) }); // target 4h
    const { service, prisma, notifications } = makeService([breached]);

    await service.checkForBreaches();

    expect(notifications.notifyBestEffort).toHaveBeenCalledTimes(1);
    expect(notifications.notifyBestEffort.mock.calls[0][0]).toContain("breach-1");
    expect(prisma.incident.update).toHaveBeenCalledWith({
      where: { id: "breach-1" },
      data: { slaBreachNotifiedAt: expect.any(Date) },
    });
  });

  it("does not notify an incident still within its SLA target", async () => {
    const withinTarget = incident({ severity: "SEV4", createdAt: hoursAgo(10) }); // target 72h
    const { service, notifications, prisma } = makeService([withinTarget]);

    await service.checkForBreaches();

    expect(notifications.notifyBestEffort).not.toHaveBeenCalled();
    expect(prisma.incident.update).not.toHaveBeenCalled();
  });

  it("only queries incidents that haven't already been notified", async () => {
    const { service, prisma } = makeService([]);

    await service.checkForBreaches();

    expect(prisma.incident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ slaBreachNotifiedAt: null }),
      }),
    );
  });
});
