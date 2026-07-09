/**
 * Axios API client pre-configured for the VoltEdge backend.
 * Automatically attaches the JWT Bearer token from localStorage
 * and handles common error shapes.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('voltedge_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor — unwrap data / handle 401 ──────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('voltedge_token');
        localStorage.removeItem('voltedge_user');
      }
    }
    return Promise.reject(error);
  },
);

/** Helper to extract error message from an API error */
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (error as AxiosError<{ message: string }>).response?.data?.message
      ?? error.message
      ?? 'An unexpected error occurred';
  }
  return String(error);
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; adminSecret?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    apiClient.post('/auth/verify-otp', data),

  forgotPasswordCheck: (email: string) =>
    apiClient.post('/auth/forgot-password/check', { email }),

  forgotPasswordReset: (email: string, newPassword: string) =>
    apiClient.post('/auth/forgot-password/reset', { email, newPassword }),

  getMe: () => apiClient.get('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    apiClient.put('/auth/profile', data),

  addAddress: (data: object) => apiClient.post('/auth/addresses', data),

  updateAddress: (addressId: string, data: object) =>
    apiClient.put(`/auth/addresses/${addressId}`, data),

  deleteAddress: (addressId: string) =>
    apiClient.delete(`/auth/addresses/${addressId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Products API
// ─────────────────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: AxiosRequestConfig['params']) =>
    apiClient.get('/products', { params }),

  search: (q: string, params?: AxiosRequestConfig['params']) =>
    apiClient.get('/products/search', { params: { q, ...params } }),

  autosuggest: (q: string) =>
    apiClient.get('/products/autosuggest', { params: { q } }),

  get: (id: string) => apiClient.get(`/products/${id}`),

  getByCategory: (slug: string, params?: AxiosRequestConfig['params']) =>
    apiClient.get(`/products/category/${slug}`, { params }),

  getCategories: () => apiClient.get('/products/categories'),

  getBanners: () => apiClient.get('/products/banners'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart API
// ─────────────────────────────────────────────────────────────────────────────

export const cartApi = {
  get:     () => apiClient.get('/cart'),
  add:     (data: { productId: string; qty?: number; variantId?: string }) =>
    apiClient.post('/cart/items', data),
  update:  (itemId: string, qty: number) =>
    apiClient.put(`/cart/items/${itemId}`, { qty }),
  remove:  (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  clear:   () => apiClient.delete('/cart'),
  lock:    () => apiClient.post('/cart/lock'),
  unlock:  () => apiClient.post('/cart/unlock'),
  applyCoupon: (couponCode: string) => apiClient.post('/cart/coupon', { couponCode }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Orders API
// ─────────────────────────────────────────────────────────────────────────────

export const ordersApi = {
  createRazorpay: (data: object) => apiClient.post('/orders/razorpay/create', data),
  verifyRazorpay: (data: object) => apiClient.post('/orders/razorpay/verify', data),
  placeCOD:       (data: object) => apiClient.post('/orders/cod', data),
  list:           (params?: AxiosRequestConfig['params']) => apiClient.get('/orders', { params }),
  get:            (id: string)   => apiClient.get(`/orders/${id}`),
  cancel:         (id: string, reason?: string) => apiClient.post(`/orders/${id}/cancel`, { reason }),
  requestReturn:  (id: string, reason?: string) => apiClient.post(`/orders/${id}/return`, { reason }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Wishlist API
// ─────────────────────────────────────────────────────────────────────────────

export const wishlistApi = {
  get:    () => apiClient.get('/wishlist'),
  toggle: (productId: string) => apiClient.post(`/wishlist/${productId}/toggle`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Reviews API
// ─────────────────────────────────────────────────────────────────────────────

export const reviewsApi = {
  get:  (productId: string, params?: AxiosRequestConfig['params']) =>
    apiClient.get(`/reviews/${productId}`, { params }),
  add:  (productId: string, data: object) =>
    apiClient.post(`/reviews/${productId}`, data),
  markHelpful: (reviewId: string) =>
    apiClient.post(`/reviews/${reviewId}/helpful`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Coupons API
// ─────────────────────────────────────────────────────────────────────────────

export const couponsApi = {
  validate: (code: string, orderTotal?: number) =>
    apiClient.post('/coupons/validate', { code, orderTotal }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin API
// ─────────────────────────────────────────────────────────────────────────────

export const adminApi = {
  dashboard:        () => apiClient.get('/admin/dashboard'),
  orders:           (params?: object) => apiClient.get('/admin/orders', { params }),
  bulkUpdateOrders: (data: object) => apiClient.post('/admin/orders/bulk-update', data),
  updateOrder:      (id: string, data: object) => apiClient.put(`/admin/orders/${id}`, data),
  products:         (params?: object) => apiClient.get('/admin/products', { params }),
  updateProduct:    (id: string, data: object) => apiClient.put(`/admin/products/${id}`, data),
  deleteProduct:    (id: string) => apiClient.delete(`/admin/products/${id}`),
  users:            (params?: object) => apiClient.get('/admin/users', { params }),
  getUser:          (id: string) => apiClient.get(`/admin/users/${id}`),
  updateUser:       (id: string, data: object) => apiClient.put(`/admin/users/${id}`, data),
  triggerSync:      () => apiClient.post('/admin/sync'),
  syncLogs:         (params?: object) => apiClient.get('/admin/sync-logs', { params }),
  createCategory:   (data: object) => apiClient.post('/admin/categories', data),
  updateCategory:   (id: string, data: object) => apiClient.put(`/admin/categories/${id}`, data),
  coupons:          () => apiClient.get('/admin/coupons'),
  createCoupon:     (data: object) => apiClient.post('/admin/coupons', data),
  updateCoupon:     (id: string, data: object) => apiClient.put(`/admin/coupons/${id}`, data),
  
  // Content
  banners:          () => apiClient.get('/admin/banners'),
  createBanner:     (data: object) => apiClient.post('/admin/banners', data),
  updateBanner:     (id: string, data: object) => apiClient.put(`/admin/banners/${id}`, data),
  deleteBanner:     (id: string) => apiClient.delete(`/admin/banners/${id}`),

  // Finance
  financeConfig:    () => apiClient.get('/admin/finance'),
  updateFinance:    (data: object) => apiClient.put('/admin/finance', data),
};

export default apiClient;
