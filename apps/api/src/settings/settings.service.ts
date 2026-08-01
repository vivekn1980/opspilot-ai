import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AI_PROVIDER_SETTING_KEY, AiProvider, DEFAULT_AI_PROVIDER } from "./constants";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAiProvider(): Promise<AiProvider> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: AI_PROVIDER_SETTING_KEY } });
    return (row?.value as AiProvider | undefined) ?? DEFAULT_AI_PROVIDER;
  }

  async getSettings() {
    return { aiProvider: await this.getAiProvider() };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    if (dto.aiProvider) {
      await this.prisma.appSetting.upsert({
        where: { key: AI_PROVIDER_SETTING_KEY },
        create: { key: AI_PROVIDER_SETTING_KEY, value: dto.aiProvider },
        update: { value: dto.aiProvider },
      });
    }
    return this.getSettings();
  }
}
