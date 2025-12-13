import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { orderId, total, shippingInfo } = location.state || {};

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy đơn hàng
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Đặt hàng thành công! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Cảm ơn bạn đã mua sắm tại Care4Pets
          </p>
          <p className="text-gray-500">
            Chúng tôi sẽ gửi email xác nhận đến <span className="font-semibold">{shippingInfo?.email || user?.email}</span>
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin đơn hàng</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="font-bold text-purple-600 text-lg">{orderId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                <p className="font-bold text-gray-800 text-lg">{formatPrice(total)}₫</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Ngày đặt</p>
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  Đang xử lý
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Địa chỉ giao hàng</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-gray-800">{shippingInfo?.fullName}</p>
              <p className="text-gray-600">{shippingInfo?.phone}</p>
              <p className="text-gray-600">
                {shippingInfo?.address}, {shippingInfo?.ward}, {shippingInfo?.district}, {shippingInfo?.city}
              </p>
              {shippingInfo?.note && (
                <p className="text-gray-500 text-sm italic">
                  Ghi chú: {shippingInfo.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Trạng thái đơn hàng</h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Đơn hàng đã được đặt</p>
                <p className="text-sm text-gray-500">{new Date().toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Đang xử lý</p>
                <p className="text-sm text-gray-500">Chúng tôi đang chuẩn bị đơn hàng của bạn</p>
              </div>
            </div>

            <div className="flex items-center gap-4 opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-400">Đang giao hàng</p>
                <p className="text-sm text-gray-400">Đơn hàng đang trên đường đến bạn</p>
              </div>
            </div>

            <div className="flex items-center gap-4 opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-400">Đã giao hàng</p>
                <p className="text-sm text-gray-400">Đơn hàng đã được giao thành công</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Xem đơn hàng của tôi
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Tiếp tục mua sắm
          </button>
        </div>

        {/* Help Box */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 text-center">
          <p className="text-gray-700 mb-2">
            Cần hỗ trợ? Liên hệ với chúng tôi
          </p>
          <div className="flex items-center justify-center gap-6">
            <a href="tel:1900123456" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-semibold">1900 1234</span>
            </a>
            <a href="mailto:support@care4pets.vn" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">support@care4pets.vn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;