import { Controller, Get, Post } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("status")
  status() {
    return { configured: this.notificationsService.isConfigured() };
  }

  @Post("test")
  test() {
    return this.notificationsService.sendAlert("🔔 Test alert from OpsPilot AI Settings page.");
  }
}
