import { AiUsageService } from "./ai-usage.service";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";

function log(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "log-1",
    provider: "KIMI",
    feature: "analyzeLogs",
    success: true,
    errorMessage: null,
    inputTokens: 10,
    outputTokens: 20,
    latencyMs: 100,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeService(logs: unknown[]) {
  const prisma = { aiUsageLog: { findMany: jest.fn().mockResolvedValue(logs), create: jest.fn() } };
  return new AiUsageService(prisma as unknown as TenantPrismaService);
}

describe("AiUsageService.getSummary", () => {
  it("aggregates calls, successes, failures, tokens, and avg latency per provider", async () => {
    const service = makeService([
      log({ provider: "KIMI", success: true, inputTokens: 10, outputTokens: 20, latencyMs: 100 }),
      log({ provider: "KIMI", success: false, inputTokens: 0, outputTokens: 0, latencyMs: 300 }),
      log({ provider: "ANTHROPIC", success: true, inputTokens: 50, outputTokens: 80, latencyMs: 500 }),
    ]);

    const summary = await service.getSummary();

    expect(summary.totalCalls).toBe(3);
    expect(summary.totalFailures).toBe(1);

    const kimi = summary.providers.find((p) => p.provider === "KIMI")!;
    expect(kimi.calls).toBe(2);
    expect(kimi.successes).toBe(1);
    expect(kimi.failures).toBe(1);
    expect(kimi.avgLatencyMs).toBe(200); // (100 + 300) / 2

    const anthropic = summary.providers.find((p) => p.provider === "ANTHROPIC")!;
    expect(anthropic.calls).toBe(1);
    expect(anthropic.inputTokens).toBe(50);
    expect(anthropic.outputTokens).toBe(80);
  });

  it("treats null token counts as zero rather than propagating NaN", async () => {
    const service = makeService([log({ inputTokens: null, outputTokens: null })]);

    const summary = await service.getSummary();

    expect(summary.providers[0].inputTokens).toBe(0);
    expect(summary.providers[0].outputTokens).toBe(0);
  });

  it("returns an empty provider breakdown when there are no logs yet", async () => {
    const service = makeService([]);

    const summary = await service.getSummary();

    expect(summary.totalCalls).toBe(0);
    expect(summary.providers).toEqual([]);
  });
});
