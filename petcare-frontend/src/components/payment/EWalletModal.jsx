import React, { useState } from 'react';
import toast from 'react-hot-toast';
// ✅ UPDATED: Import from integrated api.js
import { paymentAPI } from '../../services/api';

const EWalletModal = ({ isOpen, onClose, orderData, onConfirm }) => {
  const [selectedWallet, setSelectedWallet] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const wallets = [
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: '💳',
      color: 'blue',
      description: 'Thanh toán qua VNPay',
      available: true,
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: '🔴',
      color: 'pink',
      description: 'Thanh toán qua Ví MoMo',
      available: true,
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: '🔵',
      color: 'blue',
      description: 'Thanh toán qua ZaloPay',
      available: false,
    },
  ];

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  const handlePayment = async () => {
    if (!selectedWallet) {
      toast.error('Vui lòng chọn ví điện tử!');
      return;
    }

    const wallet = wallets.find(w => w.id === selectedWallet);
    if (!wallet.available) {
      toast.error(`${wallet.name} đang được phát triển!`);
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🔄 Creating payment URL for:', selectedWallet);
      console.log('📦 Order:', orderData);

      let paymentData;

      if (selectedWallet === 'vnpay') {
        // ✅ UPDATED: Use paymentAPI from integrated api.js
        paymentData = await paymentAPI.createVNPayPayment(orderData.orderNumber);
        console.log('✅ VNPay response:', paymentData);
        
        if (paymentData.paymentUrl) {
          toast.success('Chuyển đến VNPay...');
          // Redirect to VNPay
          window.location.href = paymentData.paymentUrl;
        } else {
          throw new Error('Không nhận được payment URL từ VNPay');
        }
      } else if (selectedWallet === 'momo') {
        // ✅ UPDATED: Use paymentAPI from integrated api.js
        paymentData = await paymentAPI.createMoMoPayment(orderData.orderNumber);
        console.log('✅ MoMo response:', paymentData);
        
        if (paymentData.payUrl) {
          toast.success('Chuyển đến MoMo...');
          // Redirect to MoMo
          window.location.href = paymentData.payUrl;
        } else {
          throw new Error('Không nhận được payment URL từ MoMo');
        }
      } else if (selectedWallet === 'zalopay') {
        toast.error('ZaloPay đang được phát triển!');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo link thanh toán!');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chọn ví điện tử</h2>
                <p className="text-purple-100 text-sm">Thanh toán nhanh chóng và bảo mật</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Số tiền thanh toán</p>
            <p className="text-4xl font-bold text-purple-600">
              {formatPrice(orderData?.total || 0)} VNĐ
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Đơn hàng: <span className="font-semibold">{orderData?.orderNumber}</span>
            </p>
          </div>

          {/* Wallet Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Chọn phương thức thanh toán</h3>
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => wallet.available && setSelectedWallet(wallet.id)}
                  disabled={!wallet.available || isProcessing}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedWallet === wallet.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${!wallet.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-${wallet.color}-100 rounded-xl flex items-center justify-center text-3xl`}>
                      {wallet.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{wallet.name}</p>
                        {!wallet.available && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                    {selectedWallet === wallet.id && (
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Thanh toán bảo mật</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Mã hóa SSL 256-bit</li>
                  <li>✓ Xác thực 2 lớp bảo mật</li>
                  <li>✓ Không lưu trữ thông tin thẻ</li>
                  <li>✓ Hoàn tiền tự động nếu có sự cố</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || !selectedWallet}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                'Thanh toán ngay'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EWalletModal;