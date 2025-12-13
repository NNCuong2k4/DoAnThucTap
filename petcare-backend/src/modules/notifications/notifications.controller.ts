import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import {
  GetNotificationsDto,
  SendNotificationDto,
  GetAllNotificationsDto,
} from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // F6.1: Get my notifications (User)
  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(@Req() req, @Query() filterDto: GetNotificationsDto) {
    return this.notificationsService.getMyNotifications(
      req.user.userId,
      filterDto,
    );
  }

  // F6.3: Mark all as read (User) - MUST be before /:id routes
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  // F6.6: Get all notifications (Admin) - MUST be before /:id routes
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllNotifications(@Query() filterDto: GetAllNotificationsDto) {
    return this.notificationsService.getAllNotifications(filterDto);
  }

  // F6.5: Send notification (Admin)
  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async sendNotification(@Body() sendDto: SendNotificationDto) {
    return this.notificationsService.sendNotification(sendDto);
  }

  // F6.2: Mark as read (User)
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  // F6.4: Delete notification (User)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Req() req, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(req.user.userId, id);
  }

  // BONUS: Get unread count (User)
  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return {
      message: 'Lấy số lượng thông báo chưa đọc thành công',
      data: {
        unreadCount: count,
      },
    };
  }
}