import axios from 'axios';

// ✅ Base URL từ backend spec
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor để tự động thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptor để xử lý response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ==================== PETS API ====================
export const petsAPI = {
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
  getMyPets: () => api.get('/pets/my-pets'),
  getVaccinations: (petId) => api.get(`/pets/${petId}/vaccinations`),
  addVaccination: (petId, data) => api.post(`/pets/${petId}/vaccinations`, data),
  updateVaccination: (petId, vaccinationId, data) => 
    api.put(`/pets/${petId}/vaccinations/${vaccinationId}`, data),
  deleteVaccination: (petId, vaccinationId) => 
    api.delete(`/pets/${petId}/vaccinations/${vaccinationId}`),
  getMedicalHistory: (petId) => api.get(`/pets/${petId}/medical-history`),
  addMedicalRecord: (petId, data) => api.post(`/pets/${petId}/medical-history`, data),
  updateMedicalRecord: (petId, recordId, data) => 
    api.put(`/pets/${petId}/medical-history/${recordId}`, data),
  deleteMedicalRecord: (petId, recordId) => 
    api.delete(`/pets/${petId}/medical-history/${recordId}`),
  uploadPhoto: (petId, photoUrl) => api.post(`/pets/${petId}/photo`, { photoUrl }),
  deletePhoto: (petId) => api.delete(`/pets/${petId}/photo`),
};

// ==================== PRODUCTS API ====================
export const productsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    return api.get(`/products?${queryParams.toString()}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get(`/products/search?query=${encodeURIComponent(query)}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ==================== CART API ====================
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCartItem: (data) => api.put('/cart/update', data),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// ==================== ORDERS API ====================
export const ordersAPI = {
  getMyOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    return api.get(`/orders/my-orders?${queryParams.toString()}`);
  },
  getById: (id) => api.get(`/orders/${id}`),
  getByOrderNumber: async (orderNumber) => {
    const response = await api.get('/orders/my-orders', {
      params: { orderNumber, limit: 1 }
    });
    return response.data.data && response.data.data.length > 0
      ? { data: response.data.data[0] }
      : { data: null };
  },
  checkout: (data) => api.post('/orders', data),
  cancel: (id, cancelData) => api.post(`/orders/${id}/cancel`, cancelData),
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
    if (params.orderNumber) queryParams.append('orderNumber', params.orderNumber);
    return api.get(`/orders?${queryParams.toString()}`);
  },
  getAwaitingPayment: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    return api.get(`/orders/awaiting-payment?${queryParams.toString()}`);
  },
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  confirmPayment: (id, data) => api.post(`/orders/${id}/confirm-payment`, data),
  getStatistics: () => api.get('/orders/stats/summary'),
  generateQrPayment: (id) => api.post(`/orders/${id}/qr-payment`),
  confirmTransfer: (id) => api.post(`/orders/${id}/confirm-transfer`),
};

// ==================== PAYMENT API ====================
export const paymentAPI = {
  createVNPayPayment: async (orderId) => {
    const response = await api.post(`/payment/vnpay/create/${orderId}`);
    return response.data;
  },
  createMoMoPayment: async (orderId) => {
    const response = await api.post(`/payment/momo/create/${orderId}`);
    return response.data;
  },
  createZaloPayPayment: async (orderId) => {
    const response = await api.post(`/payment/zalopay/create/${orderId}`);
    return response.data;
  },
  checkPaymentStatus: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};

// ==================== APPOINTMENTS API ====================
export const appointmentsAPI = {
  getMyAppointments: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.serviceType) queryParams.append('serviceType', params.serviceType);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    return api.get(`/appointments/my-appointments?${queryParams.toString()}`);
  },
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  cancel: (id, cancelData) => api.post(`/appointments/${id}/cancel`, cancelData),
  getAvailableSlots: (params) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/appointments/available-slots?${queryParams.toString()}`);
  },
  updateStatus: (id, statusData) => api.put(`/appointments/${id}/status`, statusData),
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.serviceType) queryParams.append('serviceType', params.serviceType);
    return api.get(`/appointments?${queryParams.toString()}`);
  },
  getStatistics: () => api.get('/appointments/stats/summary'),
};

// ==================== NOTIFICATIONS API ✅ FIXED ====================
export const notificationsAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);
    if (params.type) queryParams.append('type', params.type);
    const queryString = queryParams.toString();
    return api.get(`/notifications${queryString ? `?${queryString}` : ''}`);
  },
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  send: (data) => api.post('/notifications/send', data),
};

// ==================== BLOG API ====================
export const blogAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    return api.get(`/blog?${queryParams.toString()}`);
  },
  search: (query, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    return api.get(`/blog/search?${queryParams.toString()}`);
  },
  getPopular: (limit = 5) => api.get(`/blog/popular/posts?limit=${limit}`),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  getById: (id) => api.get(`/blog/${id}`),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
  getRelated: (id, limit = 3) => api.get(`/blog/${id}/related?limit=${limit}`),
  getComments: (postId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    return api.get(`/blog/${postId}/comments?${queryParams.toString()}`);
  },
  getCommentsCount: (postId) => api.get(`/blog/${postId}/comments/count`),
  addComment: (postId, data) => api.post(`/blog/${postId}/comments`, data),
  updateComment: (postId, commentId, data) => 
    api.put(`/blog/${postId}/comments/${commentId}`, data),
  deleteComment: (postId, commentId) => 
    api.delete(`/blog/${postId}/comments/${commentId}`),
  likeComment: (postId, commentId) => 
    api.post(`/blog/${postId}/comments/${commentId}/like`),
  getMyComments: () => api.get('/blog/my-comments'),
};

// ==================== ADMIN API ====================
export const adminAPI = {
  getDashboard: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    return api.get(`/admin/dashboard?${queryParams.toString()}`);
  },
  getSalesAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);
    return api.get(`/admin/analytics/sales?${queryParams.toString()}`);
  },
  getUserAnalytics: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    return api.get(`/admin/analytics/users?${queryParams.toString()}`);
  },
  getCategoryDistribution: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    return api.get(`/admin/analytics/categories?${queryParams.toString()}`);
  },
  getTopProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.period) queryParams.append('period', params.period);
    return api.get(`/admin/analytics/top-products?${queryParams.toString()}`);
  },
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    return api.get(`/admin/users?${queryParams.toString()}`);
  },
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    return api.get(`/admin/users?${queryParams.toString()}`);
  },
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, data) => api.patch(`/admin/users/${userId}/role`, data),
  updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data),
  getActivityLogs: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.action) queryParams.append('action', params.action);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    return api.get(`/admin/activity-logs?${queryParams.toString()}`);
  },
  getSystemHealth: () => api.get('/admin/system/health'),
  exportReport: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.format) queryParams.append('format', params.format);
    return api.get(`/admin/reports/export?${queryParams.toString()}`);
  },
};

export default api;