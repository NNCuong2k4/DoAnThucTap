import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express'; // ✅ FIX: Use 'import type'
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ==================== VNPay ====================

  @Post('vnpay/create/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo link thanh toán VNPay' })
  @ApiResponse({ status: 200, description: 'Tạo link thành công' })
  async createVNPayPayment(
    @Req() req: Request,
    @Param('orderId') orderId: string,
  ) {
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    return this.paymentService.createVNPayPayment(orderId, ipAddr as string);
  }

  @Get('vnpay/return')
  @ApiOperation({ summary: 'VNPay return URL (callback)' })
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentService.handleVNPayReturn(query);

    // Redirect to frontend success/failure page
    const redirectUrl = result.success
      ? `http://localhost:5173/payment/success?orderId=${result.orderId}`
      : `http://localhost:5173/payment/failure?orderId=${result.orderId}&message=${encodeURIComponent(result.message)}`;

    return res.redirect(redirectUrl);
  }

  @Get('vnpay/ipn')
  @ApiOperation({ summary: 'VNPay IPN (webhook)' })
  async vnpayIPN(@Query() query: any) {
    return this.paymentService.handleVNPayIPN(query);
  }

  // ==================== MoMo ====================

  @Post('momo/create/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo link thanh toán MoMo' })
  @ApiResponse({ status: 200, description: 'Tạo link thành công' })
  async createMoMoPayment(@Param('orderId') orderId: string) {
    return this.paymentService.createMoMoPayment(orderId);
  }

  @Get('momo/return')
  @ApiOperation({ summary: 'MoMo return URL (callback)' })
  async momoReturn(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentService.handleMoMoReturn(query);

    const redirectUrl = result.success
      ? `http://localhost:5173/payment/success?orderId=${result.orderId}`
      : `http://localhost:5173/payment/failure?orderId=${result.orderId}&message=${encodeURIComponent(result.message)}`;

    return res.redirect(redirectUrl);
  }

  @Post('momo/ipn')
  @ApiOperation({ summary: 'MoMo IPN (webhook)' })
  async momoIPN(@Body() body: any) {
    return this.paymentService.handleMoMoIPN(body);
  }

  // ==================== ZaloPay (Coming Soon) ====================

  @Post('zalopay/create/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo link thanh toán ZaloPay (Coming Soon)' })
  async createZaloPayPayment(@Param('orderId') orderId: string) {
    return {
      message: 'ZaloPay đang được phát triển',
      paymentUrl: null,
    };
  }
}