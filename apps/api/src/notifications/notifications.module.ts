import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { SlaMonitorService } from "./sla-monitor.service";

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, SlaMonitorService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
