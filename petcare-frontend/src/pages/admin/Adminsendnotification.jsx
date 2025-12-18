import React, { useState } from 'react';
import AdminLayout from '../../components/admin/Adminlayout';
import { notificationsAPI } from '../../services/api';
import { Send, Bell, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSendNotification = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '', // Empty = broadcast
    type: 'general',
    title: '',
    message: '',
    actionUrl: '',
  });

  const notificationTypes = [
    { value: 'order', label: 'Đơn hàng', icon: '🛍️' },
    { value: 'appointment', label: 'Lịch hẹn', icon: '📅' },
    { value: 'system', label: 'Hệ thống', icon: '⚙️' },
    { value: 'promotion', label: 'Khuyến mãi', icon: '🎁' },
    { value: 'general', label: 'Thông báo chung', icon: '📢' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        message: formData.message.trim(),
      };

      // Only add userId if targeting specific user
      if (formData.userId && formData.userId.trim()) {
        payload.userId = formData.userId.trim();
      }

      if (formData.actionUrl && formData.actionUrl.trim()) {
        payload.actionUrl = formData.actionUrl.trim();
      }

      const response = await notificationsAPI.send(payload);

      toast.success('Gửi thông báo thành công!');

      // Reset form
      setFormData({
        userId: '',
        type: 'general',
        title: '',
        message: '',
        actionUrl: '',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Gửi thông báo thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Quick templates
  const templates = [
    {
      title: 'Khuyến mãi đặc biệt',
      message: 'Giảm giá 20% cho tất cả sản phẩm trong tuần này! Mua ngay kẻo lỡ.',
      type: 'promotion',
      actionUrl: '/shop',
    },
    {
      title: 'Bảo trì hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 2h sáng ngày mai. Thời gian dự kiến: 1 giờ.',
      type: 'system',
      actionUrl: '',
    },
    {
      title: 'Chương trình thành viên mới',
      message: 'Chào mừng bạn đến với Care4Pets! Tận hưởng ưu đãi đặc biệt dành cho thành viên mới.',
      type: 'general',
      actionUrl: '/shop',
    },
  ];

  const applyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type,
      actionUrl: template.actionUrl,
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gửi thông báo 📢</h1>
          <p className="text-gray-600">Gửi thông báo đến người dùng hoặc tất cả người dùng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipient Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Người nhận
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleChange('userId', '')}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        !formData.userId
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Users size={24} className="text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Tất cả người dùng</p>
                        <p className="text-xs text-gray-500">Gửi broadcast</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange('userId', 'specific')}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        formData.userId
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <User size={24} className="text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Người dùng cụ thể</p>
                        <p className="text-xs text-gray-500">Nhập User ID</p>
                      </div>
                    </button>
                  </div>

                  {formData.userId && (
                    <input
                      type="text"
                      value={formData.userId === 'specific' ? '' : formData.userId}
                      onChange={(e) => handleChange('userId', e.target.value)}
                      placeholder="Nhập User ID (MongoDB ObjectId)"
                      className="mt-3 w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Loại thông báo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {notificationTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleChange('type', type.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.type === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <p className="text-xs font-semibold text-gray-700">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Nhập tiêu đề thông báo"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Nhập nội dung thông báo"
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length} ký tự
                  </p>
                </div>

                {/* Action URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link hành động (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formData.actionUrl}
                    onChange={(e) => handleChange('actionUrl', e.target.value)}
                    placeholder="/shop hoặc /appointments"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL để chuyển hướng khi người dùng click vào thông báo
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Gửi thông báo</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Templates & Preview */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} />
                Xem trước
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                {formData.title || formData.message ? (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">
                        {notificationTypes.find((t) => t.value === formData.type)?.icon || '📢'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">
                          {formData.title || 'Tiêu đề thông báo'}
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {formData.message || 'Nội dung thông báo sẽ hiển thị ở đây...'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Vừa xong</p>
                      </div>
                    </div>
                    {formData.actionUrl && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          🔗 Link: <span className="text-purple-600">{formData.actionUrl}</span>
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Nhập tiêu đề và nội dung để xem trước
                  </p>
                )}
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">Mẫu nhanh</h3>
              <div className="space-y-3">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-all"
                  >
                    <p className="font-semibold text-gray-800 text-sm mb-1">{template.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{template.message}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSendNotification;