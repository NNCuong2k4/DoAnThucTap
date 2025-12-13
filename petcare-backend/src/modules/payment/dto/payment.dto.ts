import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EWalletProvider {
  VNPAY = 'vnpay',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
}

export class CreatePaymentDto {
  @ApiProperty({ 
    example: 'ORD1732555555001', 
    description: 'Mã đơn hàng' 
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ 
    enum: EWalletProvider,
    example: EWalletProvider.VNPAY,
    description: 'Nhà cung cấp ví điện tử' 
  })
  @IsNotEmpty()
  @IsEnum(EWalletProvider)
  provider: EWalletProvider;

  @ApiProperty({ 
    example: '192.168.1.1', 
    description: 'Địa chỉ IP của người dùng',
    required: false 
  })
  @IsOptional()
  @IsString()
  ipAddr?: string;
}

export class PaymentReturnDto {
  @ApiProperty({ 
    example: 'ORD1732555555001', 
    description: 'Mã đơn hàng' 
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ 
    example: '00', 
    description: 'Mã kết quả giao dịch' 
  })
  @IsNotEmpty()
  @IsString()
  responseCode: string;

  @ApiProperty({ 
    example: '1234567890', 
    description: 'Mã giao dịch từ cổng thanh toán' 
  })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ 
    example: 'ORD1732555555001', 
    description: 'Mã đơn hàng' 
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ 
    example: 500000, 
    description: 'Số tiền thanh toán' 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ 
    example: 'abc123xyz', 
    description: 'Chữ ký từ cổng thanh toán' 
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}

export class PaymentCallbackDto {
  @ApiProperty({ description: 'Query params từ VNPay/MoMo' })
  vnp_TxnRef?: string;
  vnp_Amount?: string;
  vnp_ResponseCode?: string;
  vnp_TransactionNo?: string;
  vnp_SecureHash?: string;
  
  orderId?: string;
  amount?: number;
  resultCode?: number;
  transId?: string;
  signature?: string;
  message?: string;
}

export class RefundPaymentDto {
  @ApiProperty({ 
    example: 'ORD1732555555001', 
    description: 'Mã đơn hàng cần hoàn tiền' 
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ 
    example: 500000, 
    description: 'Số tiền hoàn' 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ 
    example: 'Khách hàng yêu cầu hoàn tiền', 
    description: 'Lý do hoàn tiền',
    required: false 
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Thanh toán thành công' })
  message: string;

  @ApiProperty({ example: 'ORD1732555555001' })
  orderId?: string;

  @ApiProperty({ example: 'https://sandbox.vnpayment.vn/...' })
  paymentUrl?: string;

  @ApiProperty({ example: 'momo://...' })
  deeplink?: string;

  @ApiProperty({ example: 'https://momo.vn/qr/...' })
  qrCodeUrl?: string;

  @ApiProperty({ example: '1234567890' })
  transactionId?: string;
}

export class CheckPaymentStatusDto {
  @ApiProperty({ 
    example: 'ORD1732555555001', 
    description: 'Mã đơn hàng cần kiểm tra' 
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ example: 'ORD1732555555001' })
  orderId: string;

  @ApiProperty({ example: 'paid' })
  paymentStatus: string;

  @ApiProperty({ example: 'confirmed' })
  orderStatus: string;

  @ApiProperty({ example: '1234567890', required: false })
  transactionId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', required: false })
  paidAt?: Date;

  @ApiProperty({ example: 500000 })
  amount: number;

  @ApiProperty({ example: 'vnpay' })
  provider?: string;
}