import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  googleAuth: (idToken, role) => api.post('/auth/google', { idToken, role }),
  getGoogleAuthUrl: (role) => api.get('/auth/google/url', { params: { role } }),
};

// Waste API
export const wasteAPI = {
  getWasteListings: (params) => api.get('/waste', { params }),
  getWasteItem: (id) => api.get(`/waste/${id}`),
  createWasteListing: (formData) => api.post('/waste', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateWasteListing: (id, formData) => api.put(`/waste/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteWasteListing: (id) => api.delete(`/waste/${id}`),
  getMyListings: (params) => api.get('/waste/my/listings', { params }),
  expressInterest: (id) => api.post(`/waste/${id}/interest`),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getBuyerOrders: (params) => api.get('/orders/my/buyer', { params }),
  getSellerOrders: (params) => api.get('/orders/my/seller', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  addReview: (id, reviewData) => api.post(`/orders/${id}/review`, reviewData),
  negotiatePrice: (id, negotiationData) => api.post(`/orders/${id}/negotiate`, negotiationData),
};

// Users API
export const usersAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  searchBusinesses: (params) => api.get('/users/search/business', { params }),
  updateUserRating: (id, rating) => api.put(`/users/${id}/rating`, { rating }),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (orderId) => api.post('/payments/create-payment-intent', { orderId }),
  confirmPayment: (paymentData) => api.post('/payments/confirm-payment', paymentData),
  createRazorpayOrder: (orderId) => api.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpayPayment: (verifyData) => api.post('/payments/razorpay/verify', verifyData),
  processRefund: (refundData) => api.post('/payments/refund', refundData),
  getPaymentMethods: () => api.get('/payments/methods'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, statusData) => api.put(`/admin/users/${id}/status`, statusData),
  getWasteListings: (params) => api.get('/admin/waste', { params }),
  updateWasteStatus: (id, statusData) => api.put(`/admin/waste/${id}/status`, statusData),
  deleteAllWasteListings: () => api.delete('/admin/waste/all', { data: { confirm: 'DELETE_ALL' } }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};

export default api;
