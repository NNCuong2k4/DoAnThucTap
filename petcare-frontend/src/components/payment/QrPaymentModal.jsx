import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// ✅ SVG Icons
const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QrPaymentModal = ({ isOpen, onClose, orderId, orderTotal }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchPaymentData();
    }
  }, [isOpen, orderId]);

  const fetchPaymentData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      
      console.log('🔍 === QR PAYMENT DEBUG ===');
      console.log('🔍 Order ID:', orderId);
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Token preview:', token ? token.substring(0, 20) + '...' : 'NULL');
      
      if (!token) {
        throw new Error('Vui lòng đăng nhập để tiếp tục');
      }

      // ✅ FIX: Try relative URL first (works with proxy)
      const apiUrl = `/api/orders/${orderId}/qr-payment`;
      console.log('🔍 API URL:', apiUrl);
      console.log('🔍 Fetching...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Payment data received:', data);

      if (!data.qrCodeUrl || !data.bankInfo) {
        console.error('❌ Invalid data structure:', data);
        throw new Error('Dữ liệu không hợp lệ từ server');
      }

      setPaymentData(data);
      console.log('✅ State updated successfully');
    } catch (err) {
      console.error('❌ === ERROR CAUGHT ===');
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      setError(err.message || 'Không thể tải thông tin thanh toán');
      toast.error(err.message || 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
      console.log('🔍 === FETCH COMPLETE ===');
    }
  };

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Đã sao chép!');
      
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      toast.error('Không thể sao chép');
    }
  };

  const handleConfirmTransfer = async () => {
    setConfirming(true);

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = `/api/orders/${orderId}/confirm-transfer`;

      console.log('🔍 Confirming transfer:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể xác nhận');
      }

      toast.success('Đã ghi nhận xác nhận của bạn!');
      
      // Redirect to orders page after 1 second
      setTimeout(() => {
        window.location.href = '/orders';
      }, 1000);
    } catch (err) {
      console.error('Error confirming transfer:', err);
      toast.error(err.message || 'Không thể xác nhận chuyển khoản');
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Chuyển khoản ngân hàng</h2>
              <p className="text-sm text-white/90 mt-1">Vui lòng chuyển khoản theo thông tin bên dưới</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tạo mã QR...</p>
              <p className="text-xs text-gray-400 mt-2">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertIcon />
                </div>
              </div>
              <p className="text-red-800 font-semibold mb-2 text-center">Có lỗi xảy ra</p>
              <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
              
              {/* Debug info */}
              <div className="bg-red-100 rounded-lg p-3 mb-4 text-xs font-mono">
                <p className="text-red-800"><strong>Order ID:</strong> {orderId}</p>
                <p className="text-red-800"><strong>Token:</strong> {localStorage.getItem('accessToken') ? 'Exists' : 'Missing'}</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchPaymentData}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Thử lại
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {!loading && !error && paymentData && (
            <>
              {/* Amount Box */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2 font-medium">Số tiền cần chuyển</p>
                <p className="text-4xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN').format(paymentData.amount)} VNĐ
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Đơn hàng: <span className="font-semibold text-gray-700">{paymentData.orderNumber}</span>
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                <p className="text-lg font-bold text-gray-800 mb-4">Quét mã QR để thanh toán</p>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-gray-200">
                    <img
                      src={paymentData.qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64 object-contain"
                      onError={(e) => {
                        console.error('QR Code failed to load:', paymentData.qrCodeUrl);
                        e.target.src = 'https://via.placeholder.com/256x256?text=QR+Error';
                      }}
                      onLoad={() => {
                        console.log('✅ QR Code loaded successfully');
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Sử dụng app ngân hàng để quét mã QR
                </p>
              </div>

              {/* Bank Info */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Thông tin tài khoản</h3>
                </div>

                <div className="space-y-3">
                  {/* Bank Name */}
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngân hàng</p>
                      <p className="font-bold text-gray-800">{paymentData.bankInfo.bankName}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(paymentData.bankInfo.bankName, 'bankName')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      {copiedField === 'bankName' ? (
                        <div className="text-green-600"><CheckIcon /></div>
                      ) : (
                        <div className="text-gray-600"><CopyIcon /></div>
                      )}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số tài khoản</p>
                      <p className="font-bold text-gray-800 text-lg">{paymentData.bankInfo.accountNo}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(paymentData.bankInfo.accountNo, 'accountNo')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      {copiedField === 'accountNo' ? (
                        <div className="text-green-600"><CheckIcon /></div>
                      ) : (
                        <div className="text-gray-600"><CopyIcon /></div>
                      )}
                    </button>
                  </div>

                  {/* Account Name */}
                  <div className="bg-white rounded-lg p-4 flex justify-between items-center border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Chủ tài khoản</p>
                      <p className="font-bold text-gray-800">{paymentData.bankInfo.accountName}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(paymentData.bankInfo.accountName, 'accountName')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      {copiedField === 'accountName' ? (
                        <div className="text-green-600"><CheckIcon /></div>
                      ) : (
                        <div className="text-gray-600"><CopyIcon /></div>
                      )}
                    </button>
                  </div>

                  {/* Transfer Content - IMPORTANT */}
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold text-sm">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-yellow-800 font-semibold mb-1">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC)</p>
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-yellow-900 text-lg">{paymentData.transferContent}</p>
                          <button
                            onClick={() => handleCopy(paymentData.transferContent, 'transferContent')}
                            className="p-2 hover:bg-yellow-100 rounded-lg transition"
                          >
                            {copiedField === 'transferContent' ? (
                              <div className="text-green-600"><CheckIcon /></div>
                            ) : (
                              <div className="text-yellow-700"><CopyIcon /></div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircleIcon />
                  Hướng dẫn thanh toán
                </h3>
                <ol className="space-y-3">
                  {paymentData.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="flex-1">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertIcon />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-800 mb-1">Lưu ý quan trọng</p>
                    <p className="text-sm text-orange-700">
                      Vui lòng chuyển khoản <strong>ĐÚNG số tiền</strong> và <strong>ĐÚNG nội dung</strong> để đơn hàng được xử lý nhanh chóng.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={confirming}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    'Tôi đã chuyển khoản'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrPaymentModal;