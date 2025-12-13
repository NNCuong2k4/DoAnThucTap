import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import Header from '../components/layout/Header';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await ordersAPI.getMyOrders(params);
      console.log('✅ Orders response:', response.data);

      const ordersData = response.data?.data || response.data || [];
      const paginationData = response.data?.pagination || {};

      setOrders(ordersData);
      setPagination({
        ...pagination,
        total: paginationData.total || ordersData.length,
        totalPages: paginationData.totalPages || 1,
      });
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng!');
      setOrders([]);
    } finally {
      setLoading(false);
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
      pending: {
        label: 'Chờ xác nhận',
        color: 'yellow',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳',
      },
      confirmed: {
        label: 'Đã xác nhận',
        color: 'blue',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '✓',
      },
      processing: {
        label: 'Đang xử lý',
        color: 'purple',
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: '📦',
      },
      shipping: {
        label: 'Đang giao hàng',
        color: 'indigo',
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        icon: '🚚',
      },
      delivered: {
        label: 'Đã giao hàng',
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'red',
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌',
      },
      refunded: {
        label: 'Đã hoàn tiền',
        color: 'gray',
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: '↩️',
      },
    };
    return configs[status] || configs.pending;
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const statusFilters = [
    { value: 'all', label: 'Tất cả', icon: '📋' },
    { value: 'pending', label: 'Chờ xác nhận', icon: '⏳' },
    { value: 'confirmed', label: 'Đã xác nhận', icon: '✓' },
    { value: 'processing', label: 'Đang xử lý', icon: '📦' },
    { value: 'shipping', label: 'Đang giao', icon: '🚚' },
    { value: 'delivered', label: 'Đã giao', icon: '✅' },
    { value: 'cancelled', label: 'Đã hủy', icon: '❌' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng của tôi</h1>
            <p className="text-gray-600">
              {pagination.total > 0 ? `${pagination.total} đơn hàng` : 'Chưa có đơn hàng nào'}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Tiếp tục mua sắm
          </button>
        </div>

        {/* Status Filters */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusFilter(filter.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === filter.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đơn hàng...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có đơn hàng</h3>
            <p className="text-gray-500 mb-6">
              {selectedStatus !== 'all'
                ? `Không có đơn hàng ${statusFilters.find(f => f.value === selectedStatus)?.label.toLowerCase()}`
                : 'Bạn chưa có đơn hàng nào'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const firstItem = order.items?.[0];
                const itemCount = order.items?.length || 0;

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                    onClick={() => handleViewDetail(order._id)}
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-purple-600">
                            #{order.orderNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(order._id);
                          }}
                          className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                        >
                          <span>Chi tiết</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Đặt lúc: {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-6">
                      <div className="flex gap-4 mb-4">
                        {/* First Item Image */}
                        {firstItem && (
                          <img
                            src={firstItem.image || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=100'}
                            alt={firstItem.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        
                        {/* Items Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {firstItem?.name || 'Sản phẩm'}
                          </h4>
                          {itemCount > 1 && (
                            <p className="text-sm text-gray-500">
                              và {itemCount - 1} sản phẩm khác
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-2">
                            Tổng: {itemCount} sản phẩm
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatPrice(order.total)}₫
                          </p>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 mb-1">
                              {order.shippingAddress?.fullName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress?.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {order.status === 'pending' && (
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement cancel
                              toast.info('Tính năng hủy đơn đang phát triển!');
                            }}
                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                          >
                            Hủy đơn hàng
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(order._id);
                            }}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement review
                              toast.info('Tính năng đánh giá đang phát triển!');
                            }}
                            className="flex-1 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-100 transition-colors"
                          >
                            ⭐ Đánh giá
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement buy again
                              toast.info('Đang thêm vào giỏ hàng...');
                            }}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Mua lại
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  const isCurrentPage = pageNum === pagination.page;
                  
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          isCurrentPage
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 2 ||
                    pageNum === pagination.page + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;