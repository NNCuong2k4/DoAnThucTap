import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, DollarSign, User, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPaymentVerification = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, totalValue: 0 });

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/orders/awaiting-payment?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Không thể tải danh sách');

      const data = await response.json();
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
      setStats({
        total: data.total || 0,
        totalValue: (data.data || []).reduce((sum, order) => sum + order.total, 0),
      });
    } catch (err) {
      toast.error(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId, orderNumber) => {
    if (!window.confirm(`Xác nhận đã nhận được thanh toán cho đơn hàng ${orderNumber}?`)) {
      return;
    }

    setConfirming(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/orders/${orderId}/confirm-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: 'Đã xác nhận thanh toán qua chuyển khoản ngân hàng',
          }),
        }
      );

      if (!response.ok) throw new Error('Không thể xác nhận thanh toán');

      toast.success('Xác nhận thanh toán thành công!');
      fetchOrders(); // Refresh list
    } catch (err) {
      toast.error(err.message || 'Không thể xác nhận thanh toán');
    } finally {
      setConfirming(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Xác nhận thanh toán</h1>
              <p className="text-gray-500 mt-1">Quản lý đơn hàng chờ xác nhận chuyển khoản</p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đơn hàng chờ xác nhận</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng giá trị</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Intl.NumberFormat('vi-VN').format(stats.totalValue)} đ
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Trang hiện tại</p>
                <p className="text-2xl font-bold text-gray-800">
                  {page} / {totalPages}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Đang tải danh sách...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có đơn hàng chờ xác nhận</h3>
            <p className="text-gray-500">Tất cả đơn hàng chuyển khoản đã được xác nhận!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Chờ xác nhận</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 mb-3">Thông tin khách hàng</h4>
                      
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Họ tên</p>
                          <p className="font-medium text-gray-800">{order.userId?.name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">{order.userId?.email || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          <p className="font-medium text-gray-800">{order.userId?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 mb-3">Địa chỉ giao hàng</h4>
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.shippingAddress?.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress?.ward && `${order.shippingAddress.ward}, `}
                            {order.shippingAddress?.district}, {order.shippingAddress?.city}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📞 {order.shippingAddress?.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>{order.items?.length || 0}</strong> sản phẩm
                    </p>
                  </div>

                  {/* Total & Action */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tổng thanh toán</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN').format(order.total)} đ
                      </p>
                    </div>
                    <button
                      onClick={() => handleConfirmPayment(order._id, order.orderNumber)}
                      disabled={confirming === order._id}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {confirming === order._id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang xác nhận...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Xác nhận thanh toán
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-gray-700">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentVerification;