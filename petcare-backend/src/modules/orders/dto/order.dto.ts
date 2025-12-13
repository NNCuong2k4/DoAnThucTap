import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  ValidateNested,
  Min,
  IsMongoId,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, OrderStatus } from '../../../schemas/order.schema';

export class ShippingAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ tên người nhận' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Đường ABC', description: 'Địa chỉ chi tiết' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'Hồ Chí Minh', description: 'Thành phố' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Quận 1', description: 'Quận/Huyện' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ example: 'Phường Bến Nghé', description: 'Phường/Xã', required: false })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ example: 'Gọi trước khi giao', description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

// ✅ NEW: Payment Details DTO
export class PaymentDetailsDto {
  @ApiProperty({ example: 'FT23120512345678', description: 'Mã giao dịch chuyển khoản', required: false })
  @IsOptional()
  @IsString()
  transferCode?: string;

  @ApiProperty({ 
    description: 'Thông tin ngân hàng', 
    required: false,
    example: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'CONG TY CARE4PETS'
    }
  })
  @IsOptional()
  @IsObject()
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };

  @ApiProperty({ example: '1234', description: '4 số cuối thẻ', required: false })
  @IsOptional()
  @IsString()
  cardLast4?: string;

  @ApiProperty({ example: 'Visa', description: 'Loại thẻ', required: false })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiProperty({ example: 'momo', description: 'Nhà cung cấp ví điện tử', required: false })
  @IsOptional()
  @IsString()
  walletProvider?: string;

  @ApiProperty({ example: 'MOMO123456789', description: 'Mã giao dịch ví điện tử', required: false })
  @IsOptional()
  @IsString()
  walletTransactionId?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.COD,
    description: 'Phương thức thanh toán',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Giao hàng nhanh', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  // ✅ NEW: Payment Details
  @ApiProperty({ type: PaymentDetailsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails?: PaymentDetailsDto;

  @ApiProperty({ example: 'https://example.com/proof.jpg', description: 'URL ảnh chứng từ thanh toán', required: false })
  @IsOptional()
  @IsString()
  paymentProof?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description: 'Trạng thái mới',
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 'Đơn hàng đã được xác nhận', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Đổi ý không mua nữa', description: 'Lý do hủy' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

// ✅ NEW: Verify Payment DTO
export class VerifyPaymentDto {
  @ApiProperty({ example: true, description: 'Xác nhận thanh toán hợp lệ' })
  @IsBoolean()
  verified: boolean;

  @ApiProperty({ example: 'Đã xác nhận chuyển khoản', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class FilterOrderDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ example: '674471234567890abcdef123', required: false })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiProperty({ example: 'ORD1732555555001', required: false })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  // ✅ NEW: Filter by payment method
  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}