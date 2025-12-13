import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { stringify } from 'querystring'; // ✅ FIX: Import stringify directly

@Injectable()
export class VNPayService {
  private readonly vnpUrl: string;
  private readonly vnpTmnCode: string;
  private readonly vnpHashSecret: string;
  private readonly vnpReturnUrl: string;

  constructor(private configService: ConfigService) {
    this.vnpUrl = this.configService.get<string>('VNPAY_URL') || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.vnpTmnCode = this.configService.get<string>('VNPAY_TMN_CODE') || 'DEMO_TMN_CODE';
    this.vnpHashSecret = this.configService.get<string>('VNPAY_HASH_SECRET') || 'DEMO_HASH_SECRET';
    this.vnpReturnUrl = this.configService.get<string>('VNPAY_RETURN_URL') || 'http://localhost:5173/payment/vnpay-return';
  }

  /**
   * Create VNPay payment URL
   */
  createPaymentUrl(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
  }): string {
    // ✅ FIX: Format dates without moment
    const now = new Date();
    const createDate = this.formatDate(now);
    const expireDate = this.formatDate(new Date(now.getTime() + 15 * 60 * 1000)); // +15 minutes

    let vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpTmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.orderId,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: params.amount * 100,
      vnp_ReturnUrl: this.vnpReturnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sort params by key
    vnpParams = this.sortObject(vnpParams);

    // Create signature
    const signData = stringify(vnpParams); // ✅ FIX: No options needed
    const hmac = crypto.createHmac('sha512', this.vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    // Create payment URL
    const paymentUrl = this.vnpUrl + '?' + stringify(vnpParams); // ✅ FIX

    return paymentUrl;
  }

  /**
   * Verify VNPay return signature
   */
  verifyReturnUrl(vnpParams: any): {
    isValid: boolean;
    responseCode: string;
    message: string;
  } {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = stringify(sortedParams); // ✅ FIX
    const hmac = crypto.createHmac('sha512', this.vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = secureHash === signed;
    const responseCode = vnpParams['vnp_ResponseCode'];

    let message = 'Giao dịch thất bại';
    if (responseCode === '00') {
      message = 'Giao dịch thành công';
    } else if (responseCode === '24') {
      message = 'Giao dịch bị hủy';
    }

    return {
      isValid,
      responseCode,
      message,
    };
  }

  /**
   * Verify VNPay IPN (webhook)
   */
  verifyIpn(vnpParams: any): {
    isValid: boolean;
    orderId: string;
    amount: number;
    responseCode: string;
  } {
    const secureHash = vnpParams['vnp_SecureHash'];
    const orderId = vnpParams['vnp_TxnRef'];
    const amount = parseInt(vnpParams['vnp_Amount']) / 100;
    const responseCode = vnpParams['vnp_ResponseCode'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = stringify(sortedParams); // ✅ FIX
    const hmac = crypto.createHmac('sha512', this.vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return {
      isValid: secureHash === signed,
      orderId,
      amount,
      responseCode,
    };
  }

  /**
   * Sort object by key
   */
  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Format date to YYYYMMDDHHmmss
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}