import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: pagination.limit,
      };
      
      if (filter === 'unread') {
        params.isRead = false;
      } else if (filter === 'read') {
        params.isRead = true;
      }
      
      const response = await notificationsAPI.getAll(params);
      
      const notificationsData = response.data?.data || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      
      const paginationInfo = response.data?.pagination || {};
      setPagination({
        page: paginationInfo.page || page,
        limit: paginationInfo.limit || 20,
        total: paginationInfo.total || 0,
        totalPages: paginationInfo.totalPages || 0,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [filter]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      toast.success('Đã đánh dấu đọc');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Không thể đánh dấu đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Không thể đánh dấu tất cả');
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      return;
    }
    
    try {
      await notificationsAPI.delete(notificationId);
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return notifDate.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order: '🛍️',
      appointment: '📅',
      system: '⚙️',
      promotion: '🎁',
      general: '📢',
    };
    return icons[type] || '🔔';
  };

  const getNotificationTypeLabel = (type) => {
    const labels = {
      order: 'Đơn hàng',
      appointment: 'Lịch hẹn',
      system: 'Hệ thống',
      promotion: 'Khuyến mãi',
      general: 'Thông báo chung',
    };
    return labels[type] || type;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header user={user} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
                <Bell size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Thông báo</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCheck size={18} />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả ({pagination.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === 'read'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Đã đọc
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có thông báo</h3>
              <p className="text-gray-500">
                {filter === 'unread'
                  ? 'Bạn đã đọc hết thông báo'
                  : 'Chưa có thông báo nào'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 cursor-pointer transition-all ${
                    notification.isRead
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full"></div>
                  )}

                  <div className="flex items-start gap-4 ml-6">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-4xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {notification.title}
                        </h3>
                        <span className="flex-shrink-0 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                        <span>•</span>
                        <span>{formatDateTime(notification.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check size={20} />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && notifications.length > 0 && pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total})
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchNotifications(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => fetchNotifications(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;