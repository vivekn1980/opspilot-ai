import { Injectable } from "@nestjs/common";
import { TenantPrismaService } from "../prisma/tenant-prisma.service";
import { AI_PROVIDER_SETTING_KEY, AiProvider, DEFAULT_AI_PROVIDER } from "./constants";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: TenantPrismaService) {}

  async getAiProvider(): Promise<AiProvider> {
    // findFirst (not findUnique) — AppSetting's real unique constraint is
    // the compound (organizationId, key), and the tenant-scoping extension
    // only knows how to inject a plain organizationId into `where`, not
    // Prisma's generated organizationId_key compound-field shape.
    const row = await this.prisma.appSetting.findFirst({ where: { key: AI_PROVIDER_SETTING_KEY } });
    return (row?.value as AiProvider | undefined) ?? DEFAULT_AI_PROVIDER;
  }

  async getSettings() {
    return { aiProvider: await this.getAiProvider() };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    if (dto.aiProvider) {
      const existing = await this.prisma.appSetting.findFirst({ where: { key: AI_PROVIDER_SETTING_KEY } });
      if (existing) {
        await this.prisma.appSetting.update({ where: { id: existing.id }, data: { value: dto.aiProvider } });
      } else {
        // organizationId: "" is a placeholder overwritten by the
        // tenant-scoping extension — see the comment in
        // AiUsageService.recordBestEffort.
        await this.prisma.appSetting.create({
          data: { organizationId: "", key: AI_PROVIDER_SETTING_KEY, value: dto.aiProvider },
        });
      }
    }
    return this.getSettings();
  }
}
