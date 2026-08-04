import { Injectable, Logger } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { AiProvider } from "../settings/constants";

export interface RecordUsageInput {
  provider: AiProvider;
  feature: string;
  success: boolean;
  errorMessage?: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number;
}

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(private readonly prisma: TenantPrismaService) {}

  // Fire-and-forget: a logging failure must never break the AI call it's
  // trying to record. Same pattern as NotificationsService.notifyBestEffort.
  recordBestEffort(input: RecordUsageInput): void {
    this.prisma.aiUsageLog
      .create({
        data: {
          // Placeholder — TenantPrismaService's tenant-scoping extension
          // overwrites this with the request's real organizationId before
          // the query runs. TypeScript still requires it in the literal
          // since the extension's injection is invisible to static types.
          organizationId: "",
          provider: input.provider,
          feature: input.feature,
          success: input.success,
          errorMessage: input.errorMessage,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          latencyMs: input.latencyMs,
        },
      })
      .catch((error) => {
        this.logger.warn(`Failed to record AI usage: ${error instanceof Error ? error.message : String(error)}`);
      });
  }

  async getSummary() {
    const logs = await this.prisma.aiUsageLog.findMany();

    const byProvider: Record<
      string,
      {
        calls: number;
        successes: number;
        failures: number;
        inputTokens: number;
        outputTokens: number;
        totalLatencyMs: number;
      }
    > = {};

    for (const log of logs) {
      const bucket = (byProvider[log.provider] ??= {
        calls: 0,
        successes: 0,
        failures: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalLatencyMs: 0,
      });
      bucket.calls += 1;
      if (log.success) bucket.successes += 1;
      else bucket.failures += 1;
      bucket.inputTokens += log.inputTokens ?? 0;
      bucket.outputTokens += log.outputTokens ?? 0;
      bucket.totalLatencyMs += log.latencyMs;
    }

    const providers = Object.entries(byProvider).map(([provider, b]) => ({
      provider,
      calls: b.calls,
      successes: b.successes,
      failures: b.failures,
      inputTokens: b.inputTokens,
      outputTokens: b.outputTokens,
      avgLatencyMs: b.calls > 0 ? Math.round(b.totalLatencyMs / b.calls) : 0,
    }));

    return {
      totalCalls: logs.length,
      totalFailures: logs.filter((l) => !l.success).length,
      providers,
    };
  }

  async getRecent(limit = 20) {
    return this.prisma.aiUsageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
