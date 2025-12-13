import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, PaymentStatus } from '../../schemas/order.schema';
import { VNPayService } from './services/vnpay.service';
import { MoMoService } from './services/momo.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly vnpayService: VNPayService,
    private readonly momoService: MoMoService,
  ) {}

  /**
   * Create VNPay payment URL
   */
  async createVNPayPayment(orderId: string, ipAddr: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const paymentUrl = this.vnpayService.createPaymentUrl({
      orderId: order.orderNumber,
      amount: order.total,
      orderInfo: `Thanh toán đơn hàng ${order.orderNumber}`,
      ipAddr,
    });

    return {
      message: 'Tạo link thanh toán VNPay thành công',
      paymentUrl,
      orderId: order._id,
      orderNumber: order.orderNumber,
    };
  }

  /**
   * Handle VNPay return callback
   */
  async handleVNPayReturn(vnpParams: any) {
    const verification = this.vnpayService.verifyReturnUrl(vnpParams);

    if (!verification.isValid) {
      return {
        success: false,
        message: 'Chữ ký không hợp lệ',
        orderId: vnpParams.vnp_TxnRef,
      };
    }

    if (verification.responseCode !== '00') {
      return {
        success: false,
        message: verification.message,
        orderId: vnpParams.vnp_TxnRef,
      };
    }

    // Update order payment status
    const order = await this.orderModel.findOne({
      orderNumber: vnpParams.vnp_TxnRef,
    });

    if (order) {
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentDetails = {
        ...order.paymentDetails,
        walletProvider: 'vnpay',
        walletTransactionId: vnpParams.vnp_TransactionNo,
        paidAt: new Date(),
      };
      await order.save();
    }

    return {
      success: true,
      message: 'Thanh toán thành công',
      orderId: vnpParams.vnp_TxnRef,
    };
  }

  /**
   * Handle VNPay IPN (webhook)
   */
  async handleVNPayIPN(vnpParams: any) {
    const verification = this.vnpayService.verifyIpn(vnpParams);

    if (!verification.isValid) {
      return { RspCode: '97', Message: 'Invalid Signature' };
    }

    const order = await this.orderModel.findOne({
      orderNumber: verification.orderId,
    });

    if (!order) {
      return { RspCode: '01', Message: 'Order Not Found' };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return { RspCode: '02', Message: 'Order Already Confirmed' };
    }

    if (verification.responseCode === '00') {
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentDetails = {
        ...order.paymentDetails,
        walletProvider: 'vnpay',
        walletTransactionId: vnpParams.vnp_TransactionNo,
        paidAt: new Date(),
      };
      await order.save();

      return { RspCode: '00', Message: 'Success' };
    }

    return { RspCode: '99', Message: 'Unknown Error' };
  }

  /**
   * Create MoMo payment URL
   */
  async createMoMoPayment(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const paymentData = await this.momoService.createPaymentUrl({
      orderId: order.orderNumber,
      amount: order.total,
      orderInfo: `Thanh toán đơn hàng ${order.orderNumber}`,
    });

    return {
      message: 'Tạo link thanh toán MoMo thành công',
      paymentUrl: paymentData.payUrl,
      deeplink: paymentData.deeplink,
      qrCodeUrl: paymentData.qrCodeUrl,
      orderId: order._id,
      orderNumber: order.orderNumber,
    };
  }

  /**
   * Handle MoMo return callback
   */
  async handleMoMoReturn(momoParams: any) {
    const verification = this.momoService.verifyReturnUrl(momoParams);

    if (!verification.isValid) {
      return {
        success: false,
        message: 'Chữ ký không hợp lệ',
        orderId: momoParams.orderId,
      };
    }

    if (verification.resultCode !== 0) {
      return {
        success: false,
        message: verification.message,
        orderId: momoParams.orderId,
      };
    }

    // Update order payment status
    const order = await this.orderModel.findOne({
      orderNumber: momoParams.orderId,
    });

    if (order) {
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentDetails = {
        ...order.paymentDetails,
        walletProvider: 'momo',
        walletTransactionId: momoParams.transId,
        paidAt: new Date(),
      };
      await order.save();
    }

    return {
      success: true,
      message: 'Thanh toán thành công',
      orderId: momoParams.orderId,
    };
  }

  /**
   * Handle MoMo IPN (webhook)
   */
  async handleMoMoIPN(momoParams: any) {
    const verification = this.momoService.verifyIpn(momoParams);

    if (!verification.isValid) {
      return { resultCode: 97, message: 'Invalid Signature' };
    }

    const order = await this.orderModel.findOne({
      orderNumber: verification.orderId,
    });

    if (!order) {
      return { resultCode: 1, message: 'Order Not Found' };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return { resultCode: 2, message: 'Order Already Confirmed' };
    }

    if (verification.resultCode === 0) {
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentDetails = {
        ...order.paymentDetails,
        walletProvider: 'momo',
        walletTransactionId: verification.transId,
        paidAt: new Date(),
      };
      await order.save();

      return { resultCode: 0, message: 'Success' };
    }

    return { resultCode: 99, message: 'Unknown Error' };
  }
}