import { Injectable } from '@nestjs/common';

@Injectable()
export class QrPaymentService {
  private readonly BANK_INFO = {
    bankCode: '970405', // Agribank
    accountNo: '1904206433619',
    accountName: 'NGUYEN NHUT CUONG',
    bankName: 'Agribank - Chi nhánh Miền Đông',
  };

  /**
   * Generate VietQR code URL
   */
  generateQrCode(orderNumber: string, amount: number): string {
    const encodedAccountName = encodeURIComponent(this.BANK_INFO.accountName);
    const encodedContent = encodeURIComponent(orderNumber);

    // VietQR API format
    return `https://img.vietqr.io/image/${this.BANK_INFO.bankCode}-${this.BANK_INFO.accountNo}-compact.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;
  }

  /**
   * Get bank information
   */
  getBankInfo() {
    return this.BANK_INFO;
  }

  /**
   * Generate complete payment details
   */
  generatePaymentDetails(orderNumber: string, amount: number) {
    return {
      qrCodeUrl: this.generateQrCode(orderNumber, amount),
      bankInfo: this.getBankInfo(),
      amount,
      orderNumber,
      transferContent: orderNumber,
      instructions: [
        'Mở ứng dụng ngân hàng và quét mã QR',
        'Kiểm tra thông tin chuyển khoản',
        'Đảm bảo nội dung chuyển khoản chính xác',
        'Xác nhận thanh toán',
      ],
    };
  }
}