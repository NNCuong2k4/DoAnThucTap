import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Activity Action Types
export enum ActivityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  CREATE_ORDER = 'create_order',
  UPDATE_ORDER = 'update_order',
  CANCEL_ORDER = 'cancel_order',
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  CREATE_APPOINTMENT = 'create_appointment',
  UPDATE_APPOINTMENT = 'update_appointment',
  CANCEL_APPOINTMENT = 'cancel_appointment',
  UPDATE_USER_ROLE = 'update_user_role',
  BAN_USER = 'ban_user',
  UNBAN_USER = 'unban_user',
  CREATE_POST = 'create_post',
  UPDATE_POST = 'update_post',
  DELETE_POST = 'delete_post',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT = 'checkout',
  PAYMENT = 'payment',
}

// Activity Status
export enum ActivityStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  user: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ActivityAction),
    required: true,
    index: true,
  })
  action: ActivityAction;

  @Prop({ trim: true })
  entity: string;

  @Prop({ type: Types.ObjectId })
  entityId: Types.ObjectId;

  @Prop({ type: Object })
  details: Record<string, any>;

  @Prop({ trim: true })
  ipAddress: string;

  @Prop({ trim: true })
  userAgent: string;

  @Prop({
    type: String,
    enum: Object.values(ActivityStatus),
    default: ActivityStatus.SUCCESS,
    index: true,
  })
  status: ActivityStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

// Indexes for performance
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ entity: 1, entityId: 1 });
ActivityLogSchema.index({ status: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 }); // For recent activities