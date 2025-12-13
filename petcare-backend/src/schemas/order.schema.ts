import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  E_WALLET = 'e_wallet',
}

// ✅ UPDATED: Added AWAITING_PAYMENT for QR payment flow
export enum PaymentStatus {
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment', // ✅ NEW: User confirmed transfer, waiting admin verify
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  image: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  district: string;

  @Prop()
  ward: string;

  @Prop()
  note: string;
}

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ _id: false })
export class StatusHistory {
  @Prop({ type: String, enum: OrderStatus, required: true })
  status: OrderStatus;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop()
  note: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId; // ✅ Already optional - Perfect!
}

export const StatusHistorySchema = SchemaFactory.createForClass(StatusHistory);

// ✅ Payment Details Schema - Already perfect!
@Schema({ _id: false })
export class PaymentDetails {
  // Bank Transfer
  @Prop()
  transferCode?: string;

  @Prop({ type: Object })
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };

  // Credit Card
  @Prop()
  cardLast4?: string;

  @Prop()
  cardType?: string;

  // E-Wallet
  @Prop()
  walletProvider?: string;

  @Prop()
  walletTransactionId?: string;

  // Common
  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;
}

export const PaymentDetailsSchema = SchemaFactory.createForClass(PaymentDetails);

@Schema({
  timestamps: true,
  collection: 'orders',
})
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING, index: true })
  status: OrderStatus;

  @Prop({ type: [StatusHistorySchema], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  shippingFee: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop()
  note: string;

  @Prop()
  cancelReason: string;

  @Prop({ type: Date })
  cancelledAt: Date;

  @Prop({ type: Date })
  deliveredAt: Date;

  // ✅ Payment Details - Already perfect!
  @Prop({ type: PaymentDetailsSchema })
  paymentDetails?: PaymentDetails;

  @Prop()
  paymentProof?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes - Already perfect!
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ paymentMethod: 1, paymentStatus: 1 }); // ✅ Perfect for admin query!

// Generate order number before save
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});