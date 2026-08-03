import { SearchService } from "./search.service";
import { PrismaService } from "../prisma/prisma.service";

function makeService(overrides: Partial<Record<string, unknown[]>> = {}) {
  const empty = () => ({ findMany: jest.fn().mockResolvedValue([]) });
  const prisma: any = {
    incident: empty(),
    problem: empty(),
    change: empty(),
    risk: empty(),
    sop: empty(),
    doc: empty(),
    runbook: empty(),
    metric: empty(),
  };
  for (const [model, rows] of Object.entries(overrides)) {
    prisma[model].findMany = jest.fn().mockResolvedValue(rows);
  }
  return new SearchService(prisma as unknown as PrismaService);
}

describe("SearchService.search", () => {
  it("returns no results for a blank query without touching the database", async () => {
    const service = makeService();
    const result = await service.search("   ");
    expect(result.results).toEqual([]);
  });

  it("maps a matching incident into a shaped result with the right href", async () => {
    const service = makeService({
      incident: [{ id: "inc-1", title: "Checkout API returning 500s", severity: "SEV1", status: "OPEN" }],
    });

    const result = await service.search("checkout");

    expect(result.results).toEqual([
      { type: "Incident", id: "inc-1", title: "Checkout API returning 500s", meta: "SEV1 · OPEN", href: "/incidents/inc-1" },
    ]);
  });

  it("aggregates matches across multiple record types", async () => {
    const service = makeService({
      incident: [{ id: "inc-1", title: "DB outage", severity: "SEV2", status: "OPEN" }],
      runbook: [{ id: "rb-1", title: "DB failover runbook", description: "" }],
    });

    const result = await service.search("db");

    expect(result.results).toHaveLength(2);
    expect(result.results.map((r) => r.type).sort()).toEqual(["Incident", "Runbook"]);
  });
});
