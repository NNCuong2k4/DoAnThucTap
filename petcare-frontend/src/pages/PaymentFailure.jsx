import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message') || 'Giao dịch không thành công';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-gray-600">
            Rất tiếc, giao dịch của bạn không thể hoàn tất
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {/* Order Info */}
          {orderId && (
            <div className="text-center pb-6 border-b-2 border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-bold text-gray-800">{orderId}</p>
            </div>
          )}

          {/* Error Message */}
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800 mb-1">Lý do thất bại</p>
                <p className="text-sm text-red-700">{message}</p>
              </div>
            </div>
          </div>

          {/* Possible Reasons */}
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nguyên nhân có thể
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Số dư tài khoản không đủ</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Thẻ/Tài khoản đã hết hạn hoặc bị khóa</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Nhập sai thông tin xác thực</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Hủy giao dịch trong quá trình thanh toán</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Lỗi kết nối với cổng thanh toán</span>
              </li>
            </ul>
          </div>

          {/* What to do next */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bạn có thể làm gì?
            </h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Kiểm tra lại thông tin tài khoản/thẻ của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Thử lại với phương thức thanh toán khác</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Liên hệ ngân hàng để được hỗ trợ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Chọn thanh toán khi nhận hàng (COD) nếu có</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <button
              onClick={() => navigate(`/checkout`)}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              Thử lại thanh toán
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/cart')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Về giỏ hàng
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 inline-block">
            <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
            <p className="font-semibold text-purple-600">
              📞 1900-xxxx
            </p>
            <p className="font-semibold text-purple-600">
              📧 support@care4pets.com
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Hỗ trợ 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;