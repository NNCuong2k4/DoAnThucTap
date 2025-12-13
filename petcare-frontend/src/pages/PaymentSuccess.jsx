import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// ✅ UPDATED: Import from integrated api.js
import { ordersAPI } from '../services/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // ✅ UPDATED: Use ordersAPI from integrated api.js
      const response = await ordersAPI.getByOrderNumber(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thanh toán thành công! 🎉
          </h1>
          <p className="text-gray-600">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý
          </p>
        </div>

        {/* Order Info Card */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        ) : order ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            {/* Order Number */}
            <div className="text-center pb-6 border-b-2 border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-bold text-purple-600">{order.orderNumber}</p>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-semibold">
                  Đã thanh toán
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái đơn hàng:</span>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold">
                  Đã xác nhận
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-semibold text-gray-800">
                  {order.paymentMethod === 'e_wallet' ? 'Ví điện tử' : order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatPrice(order.total)} VNĐ
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Địa chỉ giao hàng
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.district}, {order.shippingAddress.city}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Các bước tiếp theo
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Chúng tôi đang chuẩn bị đơn hàng của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Đơn hàng sẽ được giao trong 2-3 ngày làm việc</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Bạn sẽ nhận được thông báo khi đơn hàng đang được giao</span>
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => navigate('/orders')}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy thông tin đơn hàng</p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold"
            >
              Xem danh sách đơn hàng
            </button>
          </div>
        )}

        {/* Contact Support */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Cần hỗ trợ? Liên hệ:</p>
          <p className="font-semibold text-purple-600">
            📞 1900-xxxx | 📧 support@care4pets.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;