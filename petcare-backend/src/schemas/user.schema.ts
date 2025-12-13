import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ✅ FIX: Export UserRole enum for controllers
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  VET = 'vet',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop()
  avatar: string;

  @Prop({ 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.USER 
  })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  // ✅ FIX: Added isBanned field
  @Prop({ default: false })
  isBanned: boolean;

  // ✅ FIX: Added banReason field
  @Prop()
  banReason: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isBanned: 1 });