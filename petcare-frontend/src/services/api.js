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
    // ✅ Đổi từ 'token' → 'accessToken' theo backend spec
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
      // Token hết hạn hoặc không hợp lệ
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
  // ✅ FIXED: Changed from PUT to POST to match backend
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
// ✅ COMPLETE: All pet endpoints with medical history and photo upload
export const petsAPI = {
  // Admin methods - Manage all pets with filters
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  delete: (id) => api.delete(`/pets/${id}`),
  
  // User methods - Manage own pets
  getMyPets: () => api.get('/pets/my-pets'),
  
  // Vaccinations
  getVaccinations: (petId) => api.get(`/pets/${petId}/vaccinations`),
  addVaccination: (petId, data) => api.post(`/pets/${petId}/vaccinations`, data),
  updateVaccination: (petId, vaccinationId, data) => 
    api.put(`/pets/${petId}/vaccinations/${vaccinationId}`, data),
  deleteVaccination: (petId, vaccinationId) => 
    api.delete(`/pets/${petId}/vaccinations/${vaccinationId}`),
  
  // Medical History
  getMedicalHistory: (petId) => api.get(`/pets/${petId}/medical-history`),
  addMedicalRecord: (petId, data) => api.post(`/pets/${petId}/medical-history`, data),
  updateMedicalRecord: (petId, recordId, data) => 
    api.put(`/pets/${petId}/medical-history/${recordId}`, data),
  deleteMedicalRecord: (petId, recordId) => 
    api.delete(`/pets/${petId}/medical-history/${recordId}`),
  
  // Photo Management (will be implemented in backend)
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
    // ✅ Support categoryId for Shop page filtering
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
  // ==================== USER METHODS ====================
  
  // GET /api/orders/my-orders
  getMyOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    return api.get(`/orders/my-orders?${queryParams.toString()}`);
  },
  
  // GET /api/orders/:id
  getById: (id) => api.get(`/orders/${id}`),
  
  // Get order by order number
  getByOrderNumber: async (orderNumber) => {
    const response = await api.get('/orders/my-orders', {
      params: { orderNumber, limit: 1 }
    });
    return response.data.data && response.data.data.length > 0
      ? { data: response.data.data[0] }
      : { data: null };
  },
  
  // POST /api/orders - Create new order
  checkout: (data) => api.post('/orders', data),
  
  // POST /api/orders/:id/cancel - Cancel order
  cancel: (id, cancelData) => api.post(`/orders/${id}/cancel`, cancelData),
  
  // ==================== ADMIN METHODS ====================
  
  // GET /api/orders - Get all orders (Admin)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
    if (params.orderNumber) queryParams.append('orderNumber', params.orderNumber);
    return api.get(`/orders?${queryParams.toString()}`);
  },
  
  // GET /api/orders/awaiting-payment - Orders awaiting payment (Admin)
  getAwaitingPayment: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    return api.get(`/orders/awaiting-payment?${queryParams.toString()}`);
  },
  
  // PUT /api/orders/:id/status - Update order status (Admin)
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  
  // ✅ POST /api/orders/:id/confirm-payment - Confirm payment (Admin)
  // ⚠️ CRITICAL: This method is required for AdminOrders component!
  confirmPayment: (id, data) => api.post(`/orders/${id}/confirm-payment`, data),
  
  // GET /api/orders/stats/summary - Get statistics (Admin)
  getStatistics: () => api.get('/orders/stats/summary'),
  
  // ==================== OTHER PAYMENT METHODS ====================
  
  // POST /api/orders/:id/qr-payment - Generate QR code
  generateQrPayment: (id) => api.post(`/orders/${id}/qr-payment`),
  
  // POST /api/orders/:id/confirm-transfer - User confirms transfer
  confirmTransfer: (id) => api.post(`/orders/${id}/confirm-transfer`),
};

// ==================== PAYMENT API ====================
export const paymentAPI = {
  // VNPay
  createVNPayPayment: async (orderId) => {
    const response = await api.post(`/payment/vnpay/create/${orderId}`);
    return response.data;
  },

  // MoMo
  createMoMoPayment: async (orderId) => {
    const response = await api.post(`/payment/momo/create/${orderId}`);
    return response.data;
  },

  // ZaloPay
  createZaloPayPayment: async (orderId) => {
    const response = await api.post(`/payment/zalopay/create/${orderId}`);
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};

// ==================== APPOINTMENTS API ====================
export const appointmentsAPI = {
  // User methods
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
  
  // Admin methods
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

// ==================== NOTIFICATIONS API ====================
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ==================== BLOG API ====================
export const blogAPI = {
  // ==================== BLOG POSTS ====================
  
  // GET /api/blog - Get all blog posts
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    return api.get(`/blog?${queryParams.toString()}`);
  },
  
  // GET /api/blog/search - Search blog posts
  search: (query, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    return api.get(`/blog/search?${queryParams.toString()}`);
  },
  
  // GET /api/blog/popular/posts - Get popular posts
  getPopular: (limit = 5) => api.get(`/blog/popular/posts?limit=${limit}`),
  
  // GET /api/blog/{slug} - Get post by slug
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  
  // GET /api/blog/{id} - Get post by ID (alias for getBySlug)
  getById: (id) => api.get(`/blog/${id}`),
  
  // POST /api/blog - Create post (admin)
  create: (data) => api.post('/blog', data),
  
  // PUT /api/blog/{id} - Update post (admin)
  update: (id, data) => api.put(`/blog/${id}`, data),
  
  // DELETE /api/blog/{id} - Delete post (admin)
  delete: (id) => api.delete(`/blog/${id}`),
  
  // GET /api/blog/{id}/related - Get related posts
  getRelated: (id, limit = 3) => api.get(`/blog/${id}/related?limit=${limit}`),
  
  // ==================== COMMENTS ====================
  
  // GET /api/blog/{id}/comments - Get comments for a post
  getComments: (postId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    return api.get(`/blog/${postId}/comments?${queryParams.toString()}`);
  },
  
  // GET /api/blog/{id}/comments/count - Get comments count
  getCommentsCount: (postId) => api.get(`/blog/${postId}/comments/count`),
  
  // POST /api/blog/{id}/comments - Add comment
  addComment: (postId, data) => api.post(`/blog/${postId}/comments`, data),
  
  // PUT /api/blog/{postId}/comments/{commentId} - Update comment
  updateComment: (postId, commentId, data) => 
    api.put(`/blog/${postId}/comments/${commentId}`, data),
  
  // DELETE /api/blog/{postId}/comments/{commentId} - Delete comment
  deleteComment: (postId, commentId) => 
    api.delete(`/blog/${postId}/comments/${commentId}`),
  
  // POST /api/blog/{postId}/comments/{commentId}/like - Like comment
  likeComment: (postId, commentId) => 
    api.post(`/blog/${postId}/comments/${commentId}/like`),
  
  // GET /api/blog/my-comments - Get my comments
  getMyComments: () => api.get('/blog/my-comments'),
};


// ==================== ADMIN API ====================
export const adminAPI = {
  // Dashboard
  getDashboard: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    return api.get(`/admin/dashboard?${queryParams.toString()}`);
  },
  
  // Analytics
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
  
  // User Management
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
  
  // Activity Logs
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
  
  // System
  getSystemHealth: () => api.get('/admin/system/health'),
  
  // Reports
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