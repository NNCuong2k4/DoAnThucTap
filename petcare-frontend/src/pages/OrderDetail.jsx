import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching order detail for:', orderId);
      
      const response = await ordersAPI.getById(orderId);
      console.log('✅ Order detail response:', response.data);

      const orderData = response.data?.data || response.data;
      setOrder(orderData);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      console.error('📥 Error response:', error.response?.data);
      
      toast.error('Không thể tải thông tin đơn hàng!');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn!');
      return;
    }

    try {
      setCancelling(true);
      await ordersAPI.cancel(orderId, { reason: cancelReason });
      
      toast.success('Đã hủy đơn hàng thành công!');
      setShowCancelModal(false);
      fetchOrderDetail(); // Reload order
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Không thể hủy đơn hàng!';
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Chờ xác nhận', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
      confirmed: { label: 'Đã xác nhận', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', icon: '✓' },
      processing: { label: 'Đang xử lý', color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', icon: '📦' },
      shipping: { label: 'Đang giao hàng', color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '🚚' },
      delivered: { label: 'Đã giao hàng', color: 'green', bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      cancelled: { label: 'Đã hủy', color: 'red', bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
      refunded: { label: 'Đã hoàn tiền', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800', icon: '↩️' },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cod: '💵 Thanh toán khi nhận hàng (COD)',
      bank_transfer: '🏦 Chuyển khoản ngân hàng',
      credit_card: '💳 Thẻ tín dụng/ghi nợ',
      e_wallet: '📱 Ví điện tử',
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header user={user} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Không tìm thấy đơn hàng
            </h2>
            <p className="text-gray-600 mb-6">
              Đơn hàng này không tồn tại hoặc bạn không có quyền xem.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 mb-6 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Trở lại danh sách</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Đơn hàng #{order.orderNumber}
              </h1>
              <p className="text-gray-600">Đặt lúc: {formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-lg font-bold ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
          </div>

          {order.status === 'cancelled' && order.cancelReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-semibold mb-1">Lý do hủy:</p>
              <p className="text-red-700">{order.cancelReason}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=100'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=100';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
                      <p className="text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-purple-600 font-bold">{formatPrice(item.price)}₫</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm mb-1">Thành tiền</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatPrice(item.price * item.quantity)}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h2>
              <div className="space-y-4">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((history, index) => {
                    const historyConfig = getStatusConfig(history.status);
                    const isLatest = index === 0;

                    return (
                      <div key={index} className="flex gap-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isLatest ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <span className="text-lg">{historyConfig.icon}</span>
                          </div>
                          {index < order.statusHistory.length - 1 && (
                            <div className="absolute top-10 left-5 w-0.5 h-full bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${isLatest ? 'text-purple-600' : 'text-gray-800'}`}>
                              {historyConfig.label}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(history.timestamp)}
                            </span>
                          </div>
                          {history.note && (
                            <p className="text-gray-600 text-sm">{history.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có lịch sử</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Info */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tổng quan thanh toán</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{formatPrice(order.subtotal || order.total)}₫</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">
                    {order.shippingFee === 0 || !order.shippingFee ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      `${formatPrice(order.shippingFee)}₫`
                    )}
                  </span>
                </div>
                
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-semibold">-{formatPrice(order.discount)}₫</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatPrice(order.total)}₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Phương thức thanh toán</p>
                <p className="text-gray-800">{getPaymentMethodLabel(order.paymentMethod)}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Địa chỉ giao hàng</h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold text-gray-800">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>
                  {order.shippingAddress?.address}, {order.shippingAddress?.ward}
                </p>
                <p>
                  {order.shippingAddress?.district}, {order.shippingAddress?.city}
                </p>
                {order.shippingAddress?.note && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Ghi chú:</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}

            {order.status === 'delivered' && (
              <div className="space-y-3">
                <button
                  onClick={() => toast.info('Tính năng đánh giá đang phát triển!')}
                  className="w-full px-6 py-3 bg-yellow-50 text-yellow-700 font-semibold rounded-xl hover:bg-yellow-100 transition-colors"
                >
                  ⭐ Đánh giá sản phẩm
                </button>
                <button
                  onClick={() => toast.info('Đang thêm vào giỏ hàng...')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Mua lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCancelModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Hủy đơn hàng</h3>
              <p className="text-gray-600 mb-4">
                Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:
              </p>
              
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetail;