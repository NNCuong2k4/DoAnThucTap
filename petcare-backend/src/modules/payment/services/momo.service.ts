import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class MoMoService {
  private readonly momoApiUrl: string;
  private readonly momoPartnerCode: string;
  private readonly momoAccessKey: string;
  private readonly momoSecretKey: string;
  private readonly momoReturnUrl: string;
  private readonly momoNotifyUrl: string;

  constructor(private configService: ConfigService) {
    // ✅ PRODUCTION: Get from environment variables
    this.momoApiUrl = this.configService.get<string>('MOMO_API_URL') || 'https://test-payment.momo.vn/v2/gateway/api/create';
    this.momoPartnerCode = this.configService.get<string>('MOMO_PARTNER_CODE') || 'MOMO_PARTNER_CODE';
    this.momoAccessKey = this.configService.get<string>('MOMO_ACCESS_KEY') || 'MOMO_ACCESS_KEY';
    this.momoSecretKey = this.configService.get<string>('MOMO_SECRET_KEY') || 'MOMO_SECRET_KEY';
    this.momoReturnUrl = this.configService.get<string>('MOMO_RETURN_URL') || 'http://localhost:5173/payment/momo-return';
    this.momoNotifyUrl = this.configService.get<string>('MOMO_NOTIFY_URL') || 'http://localhost:3000/api/payment/momo/ipn';
  }

  /**
   * Create MoMo payment URL
   */
  async createPaymentUrl(params: {
    orderId: string;
    amount: number;
    orderInfo: string;
  }): Promise<{
    payUrl: string;
    deeplink?: string;
    qrCodeUrl?: string;
  }> {
    const requestId = `${params.orderId}_${Date.now()}`;
    const extraData = '';
    const requestType = 'captureWallet';
    const autoCapture = true;
    const lang = 'vi';

    // Create raw signature
    const rawSignature = 
      `accessKey=${this.momoAccessKey}&amount=${params.amount}&extraData=${extraData}&ipnUrl=${this.momoNotifyUrl}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&partnerCode=${this.momoPartnerCode}&redirectUrl=${this.momoReturnUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha256', this.momoSecretKey)
      .update(rawSignature)
      .digest('hex');

    // Request body
    const requestBody = {
      partnerCode: this.momoPartnerCode,
      partnerName: 'Care4Pets',
      storeId: 'Care4PetsStore',
      requestId: requestId,
      amount: params.amount,
      orderId: params.orderId,
      orderInfo: params.orderInfo,
      redirectUrl: this.momoReturnUrl,
      ipnUrl: this.momoNotifyUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      signature: signature,
    };

    try {
      // Call MoMo API
      const response = await axios.post(this.momoApiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.resultCode === 0) {
        return {
          payUrl: response.data.payUrl,
          deeplink: response.data.deeplink,
          qrCodeUrl: response.data.qrCodeUrl,
        };
      } else {
        throw new Error(`MoMo API Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ MoMo API Error:', error);
      throw new Error('Không thể tạo link thanh toán MoMo');
    }
  }

  /**
   * Verify MoMo return signature
   */
  verifyReturnUrl(momoParams: any): {
    isValid: boolean;
    resultCode: number;
    message: string;
  } {
    const signature = momoParams.signature;
    const orderId = momoParams.orderId;
    const requestId = momoParams.requestId;
    const amount = momoParams.amount;
    const orderInfo = momoParams.orderInfo;
    const orderType = momoParams.orderType;
    const transId = momoParams.transId;
    const resultCode = parseInt(momoParams.resultCode);
    const message = momoParams.message;
    const payType = momoParams.payType;
    const responseTime = momoParams.responseTime;
    const extraData = momoParams.extraData;

    // Create raw signature
    const rawSignature = 
      `accessKey=${this.momoAccessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${this.momoPartnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    // Generate signature
    const expectedSignature = crypto
      .createHmac('sha256', this.momoSecretKey)
      .update(rawSignature)
      .digest('hex');

    return {
      isValid: signature === expectedSignature,
      resultCode,
      message,
    };
  }

  /**
   * Verify MoMo IPN (webhook)
   */
  verifyIpn(momoParams: any): {
    isValid: boolean;
    orderId: string;
    amount: number;
    resultCode: number;
    transId: string;
  } {
    const signature = momoParams.signature;
    const orderId = momoParams.orderId;
    const requestId = momoParams.requestId;
    const amount = momoParams.amount;
    const orderInfo = momoParams.orderInfo;
    const orderType = momoParams.orderType;
    const transId = momoParams.transId;
    const resultCode = parseInt(momoParams.resultCode);
    const message = momoParams.message;
    const payType = momoParams.payType;
    const responseTime = momoParams.responseTime;
    const extraData = momoParams.extraData;

    const rawSignature = 
      `accessKey=${this.momoAccessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${this.momoPartnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.momoSecretKey)
      .update(rawSignature)
      .digest('hex');

    return {
      isValid: signature === expectedSignature,
      orderId,
      amount,
      resultCode,
      transId,
    };
  }
}