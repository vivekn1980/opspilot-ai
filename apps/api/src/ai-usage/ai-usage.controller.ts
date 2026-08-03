import { Controller, Get, Query } from "@nestjs/common";
import { AiUsageService } from "./ai-usage.service";

@Controller("ai-usage")
export class AiUsageController {
  constructor(private readonly aiUsageService: AiUsageService) {}

  @Get("summary")
  getSummary() {
    return this.aiUsageService.getSummary();
  }

  @Get("recent")
  getRecent(@Query("limit") limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : undefined;
    return this.aiUsageService.getRecent(parsed && !Number.isNaN(parsed) ? parsed : undefined);
  }
}
