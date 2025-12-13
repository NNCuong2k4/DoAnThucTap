import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Notification Types
export enum NotificationType {
  ORDER = 'order',
  APPOINTMENT = 'appointment',
  SYSTEM = 'system',
  PROMOTION = 'promotion',
  GENERAL = 'general',
}

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId; // null = broadcast to all users

  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    required: true,
    index: true,
  })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ type: Types.ObjectId })
  relatedId: Types.ObjectId; // ID of related entity (Order, Appointment, etc.)

  @Prop({ trim: true })
  relatedModel: string; // Model name (Order, Appointment, etc.)

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop()
  readAt: Date;

  @Prop({ trim: true })
  actionUrl: string; // URL to navigate to when notification clicked

  @Prop()
  deletedAt: Date; // Soft delete

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ deletedAt: 1 }); // For soft delete queries