import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
const saveAuthToStorage = (user, accessToken) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// ------------------------------------------------------
// Provider
// ------------------------------------------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------
  // Load auth state from localStorage when reload page
  // ------------------------------------------------------
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      console.log('🔍 Init Auth:', {
        hasToken: !!token,
        hasUser: !!savedUser
      });

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('✅ User restored:', parsedUser.name);
        } catch (err) {
          console.error('❌ Failed to parse saved user:', err);
          clearAuthStorage();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ------------------------------------------------------
  // Fetch / Login / Register / Logout / Update Profile
  // ------------------------------------------------------

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user || response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('📥 Profile loaded:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Fetch profile error:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Login:', credentials.email);

      const response = await authAPI.login(credentials);
      
      console.log('📦 Full API response:', response);
      console.log('📦 Response.data:', response.data);

      const { user: userData, token } = response.data;

      // ✅ FIX 1: Handle both string and object token formats (backward compatible)
      let accessToken;
      if (typeof token === 'string') {
        // Token is string: "eyJhbGc..."
        accessToken = token;
        console.log('✅ Token is string format');
      } else if (token?.accessToken) {
        // Token is object: { accessToken: "eyJhbGc...", expiresIn: "7d" }
        accessToken = token.accessToken;
        console.log('✅ Token is object format');
      } else {
        throw new Error('Access token missing or invalid format');
      }

      if (!userData) {
        throw new Error('User data missing');
      }

      console.log('✅ Access token:', accessToken.substring(0, 30) + '...');
      console.log('✅ User data:', userData);
      console.log('✅ User role:', userData.role);

      // Save to localStorage
      saveAuthToStorage(userData, accessToken);
      setUser(userData);

      toast.success(`Chào mừng ${userData.name}! 🎉`);
      
      // ✅ FIX 2: Return response.data (not boolean) for Login.jsx to access user info
      return response.data;

    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);

      const msg =
        error.response?.data?.message ||
        error.message ||
        'Đăng nhập thất bại!';

      toast.error(msg);
      
      // Clear any partial data
      clearAuthStorage();
      setUser(null);
      
      throw error;
    }
  };

  const register = async (data) => {
    try {
      console.log('📝 Register:', data.email);

      const response = await authAPI.register(data);
      const { user: newUser, token } = response.data;

      // Handle both token formats
      let accessToken;
      if (typeof token === 'string') {
        accessToken = token;
      } else if (token?.accessToken) {
        accessToken = token.accessToken;
      }

      // Auto-login if backend returns token
      if (accessToken) {
        saveAuthToStorage(newUser, accessToken);
        setUser(newUser);

        toast.success(`Đăng ký thành công! Chào mừng ${newUser.name}! 🎉`);
      } else {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      }

      return response.data;

    } catch (error) {
      console.error('❌ Register error:', error);

      const msg = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join('\n')
        : error.response?.data?.message || 'Đăng ký thất bại!';

      toast.error(msg, { style: { whiteSpace: 'pre-line' } });
      
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logout');
    clearAuthStorage();
    setUser(null);
    toast.success('Đã đăng xuất!');
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user || response.data;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Cập nhật thành công!');
      return true;
    } catch (error) {
      console.error('❌ Update profile error:', error);

      const msg = error.response?.data?.message || 'Cập nhật thất bại!';
      toast.error(msg);

      return false;
    }
  };

  // ------------------------------------------------------
  // Export context values
  // ------------------------------------------------------
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook sử dụng
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;