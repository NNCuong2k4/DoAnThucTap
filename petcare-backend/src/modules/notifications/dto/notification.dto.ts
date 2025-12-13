import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../../../schemas/notification.schema';

// DTO 1: Get notifications (User)
export class GetNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

// DTO 2: Send notification (Admin)
export class SendNotificationDto {
  @IsOptional()
  @IsMongoId({ message: 'userId phải là MongoDB ObjectId hợp lệ' })
  userId?: string; // null/undefined = broadcast to all users

  @IsEnum(NotificationType, { message: 'type không hợp lệ' })
  type: NotificationType;

  @IsString({ message: 'title phải là chuỗi' })
  title: string;

  @IsString({ message: 'message phải là chuỗi' })
  message: string;

  @IsOptional()
  @IsMongoId({ message: 'relatedId phải là MongoDB ObjectId hợp lệ' })
  relatedId?: string;

  @IsOptional()
  @IsString()
  relatedModel?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;
}

// DTO 3: Get all notifications (Admin)
export class GetAllNotificationsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsMongoId()
  userId?: string; // Filter by specific user
}

// DTO 4: Mark as read (no body needed, but keep for consistency)
export class MarkAsReadDto {
  // Empty - just for consistency
}

// DTO 5: Broadcast notification DTO (Admin - send to all users)
export class BroadcastNotificationDto {
  @IsEnum(NotificationType, { message: 'type không hợp lệ' })
  type: NotificationType;

  @IsString({ message: 'title phải là chuỗi' })
  title: string;

  @IsString({ message: 'message phải là chuỗi' })
  message: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;
}