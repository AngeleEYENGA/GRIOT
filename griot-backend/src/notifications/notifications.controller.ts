import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Req() req) {
    return this.notificationsService.list(req.user.id);
  }

  @Patch(':notificationId/lue')
  markRead(@Req() req, @Param('notificationId') notificationId: string) {
    return this.notificationsService.markRead(req.user.id, notificationId);
  }
}
