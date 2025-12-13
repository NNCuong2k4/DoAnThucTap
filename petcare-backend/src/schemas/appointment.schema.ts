import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export enum ServiceType {
  GROOMING = 'grooming',
  VETERINARY = 'veterinary',
  SPA = 'spa',
  TRAINING = 'training',
  HOTEL = 'hotel',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TimeSlot {
  SLOT_08_09 = '08:00-09:00',
  SLOT_09_10 = '09:00-10:00',
  SLOT_10_11 = '10:00-11:00',
  SLOT_11_12 = '11:00-12:00',
  SLOT_13_14 = '13:00-14:00',
  SLOT_14_15 = '14:00-15:00',
  SLOT_15_16 = '15:00-16:00',
  SLOT_16_17 = '16:00-17:00',
  SLOT_17_18 = '17:00-18:00',
}

@Schema()
export class StatusHistory {
  @Prop({ type: String, enum: AppointmentStatus, required: true })
  status: AppointmentStatus;

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  note: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true, index: true })
  petId: Types.ObjectId;

  @Prop({ type: String, enum: ServiceType, required: true, index: true })
  serviceType: ServiceType;

  @Prop({ required: true, index: true })
  appointmentDate: Date;

  @Prop({ type: String, enum: TimeSlot, required: true })
  timeSlot: TimeSlot;

  @Prop({ type: String, enum: AppointmentStatus, default: AppointmentStatus.PENDING, index: true })
  status: AppointmentStatus;

  @Prop({ type: [StatusHistory], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ required: true })
  price: number;

  @Prop()
  notes: string;

  @Prop()
  customerName: string;

  @Prop()
  customerPhone: string;

  @Prop()
  cancelReason: string;

  @Prop()
  cancelledAt: Date;

  @Prop()
  completedAt: Date;

  @Prop()
  veterinarianNotes: string;

  @Prop({ default: false })
  isPaid: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Indexes
AppointmentSchema.index({ userId: 1, status: 1 });
AppointmentSchema.index({ appointmentDate: 1, timeSlot: 1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 });
AppointmentSchema.index({ createdAt: -1 });

// Prevent double booking
AppointmentSchema.index(
  { appointmentDate: 1, timeSlot: 1, serviceType: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['pending', 'confirmed', 'in_progress'] } 
    }
  }
);