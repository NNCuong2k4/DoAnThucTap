import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/Adminlayout';
import { notificationsAPI } from '../../services/api';
import { Send, Bell, Users, User, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSendNotification = () => {
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recipientType, setRecipientType] = useState('broadcast');
  
  const [formData, setFormData] = useState({
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

  // ✅ FETCH USERS - USING WORKING METHOD (Direct fetch)
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const usersData = data.users || data.data || [];
      const usersList = Array.isArray(usersData) ? usersData : [];
      
      setUsers(usersList);
      setFilteredUsers(usersList);
      
      console.log('✅ Loaded', usersList.length, 'users');
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchUser.trim() === '') {
      setFilteredUsers(users);
    } else {
      const searchLower = searchUser.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
      setFilteredUsers(filtered);
    }
  }, [searchUser, users]);

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

      if (recipientType === 'specific' && selectedUser) {
        payload.userId = selectedUser._id;
      }

      if (formData.actionUrl && formData.actionUrl.trim()) {
        payload.actionUrl = formData.actionUrl.trim();
      }

      console.log('📤 Sending notification:', payload);
      await notificationsAPI.send(payload);

      toast.success('Gửi thông báo thành công!');

      setFormData({
        type: 'general',
        title: '',
        message: '',
        actionUrl: '',
      });
      setRecipientType('broadcast');
      setSelectedUser(null);
      setSearchUser('');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Gửi thông báo thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowUserDropdown(false);
    setSearchUser('');
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
  };

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
                      onClick={() => {
                        setRecipientType('broadcast');
                        setSelectedUser(null);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        recipientType === 'broadcast'
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
                      onClick={() => setRecipientType('specific')}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        recipientType === 'specific'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <User size={24} className="text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Người dùng cụ thể</p>
                        <p className="text-xs text-gray-500">Chọn từ danh sách</p>
                      </div>
                    </button>
                  </div>

                  {/* USER SELECTION DROPDOWN */}
                  {recipientType === 'specific' && (
                    <div className="mt-4">
                      {selectedUser ? (
                        <div className="flex items-center justify-between p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                              {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                              <p className="text-sm text-gray-600">{selectedUser.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveUser}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchUser}
                              onChange={(e) => setSearchUser(e.target.value)}
                              onFocus={() => setShowUserDropdown(true)}
                              placeholder="Tìm kiếm người dùng theo tên hoặc email..."
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                            />
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          </div>

                          {showUserDropdown && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserDropdown(false)}
                              />

                              <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                                {loadingUsers ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                  </div>
                                ) : filteredUsers.length === 0 ? (
                                  <div className="px-4 py-8 text-center">
                                    <p className="text-gray-500 mb-2">
                                      {searchUser ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
                                    </p>
                                    {users.length === 0 && !searchUser && (
                                      <button
                                        type="button"
                                        onClick={fetchUsers}
                                        className="text-sm text-purple-600 hover:text-purple-700"
                                      >
                                        🔄 Thử tải lại
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  filteredUsers.map((user) => (
                                    <button
                                      key={user._id}
                                      type="button"
                                      onClick={() => handleSelectUser(user)}
                                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                                    >
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                      <div className="flex-1 text-left">
                                        <p className="font-semibold text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                      </div>
                                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                        {user.role}
                                      </span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
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
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length} ký tự</p>
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
                  disabled={loading || (recipientType === 'specific' && !selectedUser)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} />
                Xem trước
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                {recipientType === 'specific' && selectedUser && (
                  <div className="mb-3 pb-3 border-b border-gray-300">
                    <p className="text-xs text-gray-500 mb-1">Gửi đến:</p>
                    <p className="text-sm font-semibold text-purple-600">{selectedUser.name}</p>
                  </div>
                )}
                {recipientType === 'broadcast' && (
                  <div className="mb-3 pb-3 border-b border-gray-300">
                    <p className="text-xs text-gray-500 mb-1">Gửi đến:</p>
                    <p className="text-sm font-semibold text-purple-600">Tất cả người dùng</p>
                  </div>
                )}

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

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng người dùng</span>
                  <span className="font-bold text-gray-800">{users.length}</span>
                </div>
                {recipientType === 'specific' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Người nhận</span>
                    <span className="font-bold text-purple-600">1 người</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Người nhận</span>
                    <span className="font-bold text-purple-600">{users.length} người</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSendNotification;