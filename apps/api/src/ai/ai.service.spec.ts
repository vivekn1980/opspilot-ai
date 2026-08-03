import { RequestTimeoutException } from "@nestjs/common";
import { AiService } from "./ai.service";
import { SettingsService } from "../settings/settings.service";
import { AiUsageService } from "../ai-usage/ai-usage.service";

// The SDK clients are constructed in AiService's field initializers, which
// run on `new AiService(...)`. The Anthropic client throws at construction
// if no API key is discoverable, so give it one before any test instantiates
// the service — these tests never make a real network call.
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.TOKENROUTER_API_KEY = "test-tokenrouter-key";

function makeService(provider: "KIMI" | "ANTHROPIC") {
  const settings = { getAiProvider: jest.fn().mockResolvedValue(provider) };
  const aiUsage = { recordBestEffort: jest.fn() };
  const service = new AiService(settings as unknown as SettingsService, aiUsage as unknown as AiUsageService);
  return { service, settings, aiUsage };
}

describe("AiService provider routing", () => {
  it("routes through completeWithKimi when the active provider is KIMI", async () => {
    const { service } = makeService("KIMI");
    jest
      .spyOn(service as any, "completeWithKimi")
      .mockResolvedValue({ text: "kimi response", inputTokens: 10, outputTokens: 20 });
    const anthropicSpy = jest.spyOn(service as any, "completeWithAnthropic");

    const result = await service.analyzeLogs("some log line");

    expect(result).toBe("kimi response");
    expect(anthropicSpy).not.toHaveBeenCalled();
  });

  it("routes through completeWithAnthropic when the active provider is ANTHROPIC", async () => {
    const { service } = makeService("ANTHROPIC");
    jest
      .spyOn(service as any, "completeWithAnthropic")
      .mockResolvedValue({ text: "claude response", inputTokens: 15, outputTokens: 25 });
    const kimiSpy = jest.spyOn(service as any, "completeWithKimi");

    const result = await service.analyzeLogs("some log line");

    expect(result).toBe("claude response");
    expect(kimiSpy).not.toHaveBeenCalled();
  });
});

describe("AiService timeout handling", () => {
  it("wraps a timeout error in a friendly RequestTimeoutException naming the active provider", async () => {
    const { service } = makeService("KIMI");
    jest.spyOn(service as any, "completeWithKimi").mockRejectedValue(new Error("Request timed out."));

    await expect(service.analyzeLogs("some log line")).rejects.toBeInstanceOf(RequestTimeoutException);
    await expect(service.analyzeLogs("some log line")).rejects.toThrow(/Kimi K3 didn't respond within 150s/);
  });

  it("does not disguise a non-timeout error as a timeout", async () => {
    const { service } = makeService("KIMI");
    const authError = new Error("401 Unauthorized");
    jest.spyOn(service as any, "completeWithKimi").mockRejectedValue(authError);

    await expect(service.analyzeLogs("some log line")).rejects.toThrow("401 Unauthorized");
  });
});

describe("AiService usage logging", () => {
  it("records a successful call with the feature name, provider, and token counts", async () => {
    const { service, aiUsage } = makeService("KIMI");
    jest
      .spyOn(service as any, "completeWithKimi")
      .mockResolvedValue({ text: "ok", inputTokens: 42, outputTokens: 7 });

    await service.generateRca({ title: "t", description: "d" });

    expect(aiUsage.recordBestEffort).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "KIMI",
        feature: "generateRca",
        success: true,
        inputTokens: 42,
        outputTokens: 7,
      }),
    );
  });

  it("records a failed call with success:false and the error message, without null token counts crashing anything", async () => {
    const { service, aiUsage } = makeService("KIMI");
    jest.spyOn(service as any, "completeWithKimi").mockRejectedValue(new Error("401 Unauthorized"));

    await expect(service.generateRca({ title: "t", description: "d" })).rejects.toThrow();

    expect(aiUsage.recordBestEffort).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "KIMI",
        feature: "generateRca",
        success: false,
        errorMessage: "401 Unauthorized",
        inputTokens: null,
        outputTokens: null,
      }),
    );
  });
});
