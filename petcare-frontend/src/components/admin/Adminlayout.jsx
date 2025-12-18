import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../../pages/Notificationbell';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ SIDEBAR MENU - UPDATED WITH NOTIFICATIONS
  const menuItems = [
    {
      name: 'Quản lý',
      icon: '📊',
      path: '/admin/dashboard',
      label: 'Tổng quan',
      description: 'Dashboard & Analytics'
    },
    {
      name: 'Người dùng',
      icon: '👥',
      path: '/admin/users',
      label: 'Người dùng',
      description: 'Quản lý users'
    },
    {
      name: 'Danh mục',
      icon: '🏷️',
      path: '/admin/categories',
      label: 'Danh mục',
      description: 'Quản lý categories'
    },
    {
      name: 'Sản phẩm',
      icon: '📦',
      path: '/admin/products',
      label: 'Sản phẩm',
      description: 'Quản lý products'
    },
    {
      name: 'Đơn hàng',
      icon: '🛒',
      path: '/admin/orders',
      label: 'Đơn hàng',
      description: 'Quản lý orders'
    },
    {
      name: 'Lịch hẹn',
      icon: '📅',
      path: '/admin/appointments',
      label: 'Lịch hẹn',
      description: 'Quản lý appointments'
    },
    {
      name: 'Thú cưng',
      icon: '🐾',
      path: '/admin/pets',
      label: 'Thú cưng',
      description: 'Quản lý pets'
    },
    {
      name: 'Blog',
      icon: '📝',
      path: '/admin/blog',
      label: 'Blog',
      description: 'Quản lý blog'
    },
    {
      name: 'Thông báo',
      icon: '📢',
      path: '/admin/notifications/send',
      label: 'Gửi thông báo',
      description: 'Gửi thông báo đến users'
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-purple-600 to-pink-600 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐾</span>
              <span className="text-xl font-bold">Admin Panel</span>
            </div>
          )}
          {!sidebarOpen && (
            <span className="text-3xl mx-auto">🐾</span>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-white/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Toggle Sidebar Button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">{sidebarOpen ? '◀️' : '▶️'}</span>
            {sidebarOpen && <span className="text-sm">Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Right Side: Notifications & User */}
            <div className="flex items-center gap-6">
              {/* ✅ NOTIFICATION BELL - INTEGRATED */}
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {getInitials(user?.name)}
                  </div>
                  
                  {/* User Info */}
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || 'admin@care4pets.com'}
                    </p>
                  </div>

                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || 'admin@care4pets.com'}
                      </p>
                      <div className="mt-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          👑 Admin
                        </span>
                      </div>
                    </div>

                    {/* Quick Navigation - Matches Sidebar */}
                    <div className="py-2">
                      <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Quản lý nhanh
                      </p>
                      
                      {menuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isActive(item.path)
                              ? 'bg-purple-50 text-purple-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                          {isActive(item.path) && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </Link>
                      ))}

                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Additional Options */}
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">👤</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Hồ sơ cá nhân</p>
                          <p className="text-xs text-gray-500">Xem và chỉnh sửa</p>
                        </div>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">⚙️</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Cài đặt</p>
                          <p className="text-xs text-gray-500">Tùy chỉnh hệ thống</p>
                        </div>
                      </Link>

                      {/* ✅ NOTIFICATIONS LINK - ADDED */}
                      <Link
                        to="/notifications"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">🔔</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Thông báo của tôi</p>
                          <p className="text-xs text-gray-500">Xem thông báo cá nhân</p>
                        </div>
                      </Link>

                      <div className="border-t border-gray-200 my-2"></div>

                      {/* Logout */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                      >
                        <span className="text-lg">🚪</span>
                        <div>
                          <p className="text-sm font-medium text-red-600">Đăng xuất</p>
                          <p className="text-xs text-gray-500">Thoát khỏi hệ thống</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Add Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;