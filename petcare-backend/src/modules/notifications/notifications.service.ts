import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../../schemas/notification.schema';
import {
  GetNotificationsDto,
  SendNotificationDto,
  GetAllNotificationsDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  // F6.1: Get my notifications (User)
  async getMyNotifications(userId: string, filterDto: GetNotificationsDto) {
    const { page = 1, limit = 20, isRead, type } = filterDto;

    const filter: any = {
      $or: [
        { userId: new Types.ObjectId(userId) }, // Notifications for this user
        { userId: null }, // Broadcast notifications
      ],
      deletedAt: null, // Exclude soft deleted
    };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    if (type) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { userId: null },
        ],
        isRead: false,
        deletedAt: null,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Lấy danh sách thông báo thành công',
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      unreadCount,
    };
  }

  // F6.2: Mark notification as read (User)
  async markAsRead(userId: string, notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('ID thông báo không hợp lệ');
    }

    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    // Check ownership (user notifications or broadcast)
    if (
      notification.userId &&
      notification.userId.toString() !== userId
    ) {
      throw new ForbiddenException('Bạn không có quyền đánh dấu thông báo này');
    }

    // Already read
    if (notification.isRead) {
      return {
        message: 'Thông báo đã được đánh dấu đọc trước đó',
        data: notification,
      };
    }

    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return {
      message: 'Đánh dấu đã đọc thành công',
      data: notification,
    };
  }

  // F6.3: Mark all notifications as read (User)
  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      {
        $or: [
          { userId: new Types.ObjectId(userId) },
          { userId: null },
        ],
        isRead: false,
        deletedAt: null,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return {
      message: 'Đánh dấu tất cả thông báo đã đọc thành công',
      data: {
        modifiedCount: result.modifiedCount,
      },
    };
  }

  // F6.4: Delete notification (User - soft delete)
  async deleteNotification(userId: string, notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('ID thông báo không hợp lệ');
    }

    const notification = await this.notificationModel.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    // Check ownership (user notifications or broadcast)
    if (
      notification.userId &&
      notification.userId.toString() !== userId
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa thông báo này');
    }

    // Soft delete
    notification.deletedAt = new Date();
    await notification.save();

    return {
      message: 'Xóa thông báo thành công',
    };
  }

  // F6.5: Send notification (Admin)
  async sendNotification(sendDto: SendNotificationDto) {
    const notificationData: any = {
      type: sendDto.type,
      title: sendDto.title,
      message: sendDto.message,
    };

    // Set userId (null = broadcast to all users)
    if (sendDto.userId) {
      notificationData.userId = new Types.ObjectId(sendDto.userId);
    } else {
      notificationData.userId = null; // Broadcast
    }

    // Set related entity if provided
    if (sendDto.relatedId) {
      notificationData.relatedId = new Types.ObjectId(sendDto.relatedId);
    }

    if (sendDto.relatedModel) {
      notificationData.relatedModel = sendDto.relatedModel;
    }

    if (sendDto.actionUrl) {
      notificationData.actionUrl = sendDto.actionUrl;
    }

    const notification = new this.notificationModel(notificationData);
    await notification.save();

    const recipientMessage = sendDto.userId
      ? 'người dùng cụ thể'
      : 'tất cả người dùng';

    return {
      message: `Gửi thông báo đến ${recipientMessage} thành công`,
      data: notification,
    };
  }

  // F6.6: Get all notifications (Admin)
  async getAllNotifications(filterDto: GetAllNotificationsDto) {
    const { page = 1, limit = 20, type, isRead, userId } = filterDto;

    const filter: any = {
      deletedAt: null,
    };

    if (type) {
      filter.type = type;
    }

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get statistics
    const [totalNotifications, unreadCount, byType] = await Promise.all([
      this.notificationModel.countDocuments({ deletedAt: null }),
      this.notificationModel.countDocuments({ isRead: false, deletedAt: null }),
      this.notificationModel.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      message: 'Lấy danh sách thông báo thành công',
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      statistics: {
        totalNotifications,
        unreadCount,
        byType: byType.map((item) => ({
          type: item._id,
          count: item.count,
        })),
      },
    };
  }

  // HELPER: Create notification (for internal use by other services)
  async createNotification(data: {
    userId?: string; // null = broadcast
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    relatedModel?: string;
    actionUrl?: string;
  }) {
    const notificationData: any = {
      type: data.type,
      title: data.title,
      message: data.message,
    };

    if (data.userId) {
      notificationData.userId = new Types.ObjectId(data.userId);
    } else {
      notificationData.userId = null;
    }

    if (data.relatedId) {
      notificationData.relatedId = new Types.ObjectId(data.relatedId);
    }

    if (data.relatedModel) {
      notificationData.relatedModel = data.relatedModel;
    }

    if (data.actionUrl) {
      notificationData.actionUrl = data.actionUrl;
    }

    const notification = new this.notificationModel(notificationData);
    await notification.save();

    return notification;
  }

  // HELPER: Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      $or: [
        { userId: new Types.ObjectId(userId) },
        { userId: null },
      ],
      isRead: false,
      deletedAt: null,
    });
  }
}