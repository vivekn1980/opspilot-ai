import { RequestTimeoutException } from "@nestjs/common";
import { AiService } from "./ai.service";
import { SettingsService } from "../settings/settings.service";

// The SDK clients are constructed in AiService's field initializers, which
// run on `new AiService(...)`. The Anthropic client throws at construction
// if no API key is discoverable, so give it one before any test instantiates
// the service — these tests never make a real network call.
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.TOKENROUTER_API_KEY = "test-tokenrouter-key";

function makeService(provider: "KIMI" | "ANTHROPIC") {
  const settings = { getAiProvider: jest.fn().mockResolvedValue(provider) };
  const service = new AiService(settings as unknown as SettingsService);
  return { service, settings };
}

describe("AiService provider routing", () => {
  it("routes through completeWithKimi when the active provider is KIMI", async () => {
    const { service } = makeService("KIMI");
    jest.spyOn(service as any, "completeWithKimi").mockResolvedValue("kimi response");
    const anthropicSpy = jest.spyOn(service as any, "completeWithAnthropic");

    const result = await service.analyzeLogs("some log line");

    expect(result).toBe("kimi response");
    expect(anthropicSpy).not.toHaveBeenCalled();
  });

  it("routes through completeWithAnthropic when the active provider is ANTHROPIC", async () => {
    const { service } = makeService("ANTHROPIC");
    jest.spyOn(service as any, "completeWithAnthropic").mockResolvedValue("claude response");
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
