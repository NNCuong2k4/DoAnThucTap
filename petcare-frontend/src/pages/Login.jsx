import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔐 Starting login with:', formData.email);
      const response = await login(formData);
      
      // ✅ DEBUG: Log toàn bộ response
      console.log('📦 Full login response:', response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.user:', response.user);
      
      // ✅ Thử nhiều cách lấy user info
      let user = null;
      
      // Cách 1: response.user
      if (response.user) {
        user = response.user;
        console.log('✅ Found user in response.user:', user);
      }
      // Cách 2: response.data.user
      else if (response.data?.user) {
        user = response.data.user;
        console.log('✅ Found user in response.data.user:', user);
      }
      // Cách 3: response.data (user object trực tiếp)
      else if (response.data && response.data.email) {
        user = response.data;
        console.log('✅ Found user in response.data directly:', user);
      }
      
      console.log('👤 Final user object:', user);
      console.log('🎭 User role:', user?.role);
      console.log('🎭 User role type:', typeof user?.role);
      
      if (user) {
        // Lưu vào localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log('💾 Saved user to localStorage');
        
        // Verify localStorage
        const savedUser = JSON.parse(localStorage.getItem('user'));
        console.log('✅ Verified localStorage user:', savedUser);
        console.log('✅ Verified role:', savedUser?.role);
        
        // ⭐ CHECK ROLE VÀ REDIRECT
        const userRole = user.role?.toLowerCase(); // Convert to lowercase để so sánh
        console.log('🔍 Checking role (lowercase):', userRole);
        
        if (userRole === 'admin') {
          console.log('🎉 Admin detected! Redirecting to /admin/dashboard');
          toast.success('🎉 Chào mừng Admin!');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('👤 Regular user detected! Redirecting to /');
          toast.success('🎉 Đăng nhập thành công!');
          navigate('/', { replace: true });
        }
      } else {
        console.log('⚠️ No user info found in response');
        toast.success('🎉 Đăng nhập thành công!');
        navigate('/', { replace: true });
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Care4Pets
          </h1>
          <p className="text-gray-600">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-xs text-gray-600 font-mono">
            🐛 Debug Mode: Check console (F12) for detailed logs
          </p>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">hoặc đăng nhập với</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
            <span className="text-sm font-semibold text-gray-700">Google</span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
            <span className="text-sm font-semibold text-gray-700">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;