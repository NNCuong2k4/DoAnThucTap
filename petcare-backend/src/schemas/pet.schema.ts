import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PetDocument = Pet & Document;

// ✅ FIX: Vaccination subdocument with explicit _id field
@Schema({ _id: true, timestamps: true })
export class Vaccination {
  // ✅ CRITICAL: Explicitly define _id field
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: Date })
  nextDue: Date;

  @Prop()
  notes: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VaccinationSchema = SchemaFactory.createForClass(Vaccination);

// ✅ FIX: Medical Record subdocument matching AddMedicalRecordDto
@Schema({ _id: true, timestamps: true })
export class MedicalRecord {
  // ✅ Explicitly define _id
  _id: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop()
  veterinarian: string;

  @Prop()
  clinic: string;

  @Prop({ type: [String], default: [] })
  diagnosis: string[];

  @Prop({ type: [String], default: [] })
  prescription: string[];

  @Prop({ type: [String], default: [] })
  documents: string[];

  @Prop({ type: Date })
  followUpDate: Date;

  @Prop({ type: Number, default: 0 })
  cost: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

// Main Pet schema
@Schema({ timestamps: true })
export class Pet {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  species: string;

  @Prop({ required: true, trim: true })
  breed: string;

  @Prop({ required: true, enum: ['male', 'female'] })
  gender: string;

  @Prop({ type: Date })
  dob: Date;

  @Prop({ type: Number, min: 0 })
  weight: number;

  // ✅ FIX: Allow null/undefined for photo
  @Prop({ type: String, default: null })
  photo: string | null;

  @Prop()
  microchipId: string;

  @Prop({ type: [VaccinationSchema], default: [] })
  vaccinations: Vaccination[];

  @Prop({ type: [MedicalRecordSchema], default: [] })
  medicalHistory: MedicalRecord[];

  @Prop()
  notes: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PetSchema = SchemaFactory.createForClass(Pet);

// Indexes for better query performance
PetSchema.index({ ownerId: 1 });
PetSchema.index({ species: 1 });
PetSchema.index({ isActive: 1 });