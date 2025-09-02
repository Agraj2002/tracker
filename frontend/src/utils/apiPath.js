import axios from 'axios';

// Base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://tracker-8lko.onrender.com' : 'http://localhost:5000'); 

// Create axios instance with default configuration
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/api/auth/register`,
    LOGOUT: `${BASE_URL}/api/auth/logout`,
    ME: `${BASE_URL}/api/auth/me`,
    REFRESH: `${BASE_URL}/api/auth/refresh`,
  },
  
  // Transaction endpoints
  TRANSACTIONS: {
    BASE: `${BASE_URL}/api/transactions`,
    CREATE: `${BASE_URL}/api/transactions`,
    UPDATE: (id) => `${BASE_URL}/api/transactions/${id}`,
    DELETE: (id) => `${BASE_URL}/api/transactions/${id}`,
    GET_BY_ID: (id) => `${BASE_URL}/api/transactions/${id}`,
    SEARCH: `${BASE_URL}/api/transactions/search`,
    EXPORT: `${BASE_URL}/api/transactions/export`,
  },
  
  // Category endpoints
  CATEGORIES: {
    BASE: `${BASE_URL}/api/categories`,
    CREATE: `${BASE_URL}/api/categories`,
    UPDATE: (id) => `${BASE_URL}/api/categories/${id}`,
    DELETE: (id) => `${BASE_URL}/api/categories/${id}`,
    GET_BY_ID: (id) => `${BASE_URL}/api/categories/${id}`,
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: `${BASE_URL}/api/analytics/dashboard`,
    TRENDS: `${BASE_URL}/api/analytics/trends`,
    PATTERNS: `${BASE_URL}/api/analytics/patterns`,
    BUDGET: `${BASE_URL}/api/analytics/budget`,
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: `${BASE_URL}/api/admin/users`,
    STATS: `${BASE_URL}/api/admin/stats`,
    UPDATE_USER_ROLE: (id) => `${BASE_URL}/api/admin/users/${id}/role`,
    DELETE_USER: (id) => `${BASE_URL}/api/admin/users/${id}`,
  }
};

// API service functions
export const apiService = {
  // Authentication services
  auth: {
    login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
    logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
    getCurrentUser: () => api.get(API_ENDPOINTS.AUTH.ME),
    refreshToken: () => api.post(API_ENDPOINTS.AUTH.REFRESH),
  },
  
  // Transaction services
  transactions: {
    getAll: (params = {}) => api.get(API_ENDPOINTS.TRANSACTIONS.BASE, { params }),
    getById: (id) => api.get(API_ENDPOINTS.TRANSACTIONS.GET_BY_ID(id)),
    create: (data) => api.post(API_ENDPOINTS.TRANSACTIONS.CREATE, data),
    update: (id, data) => api.put(API_ENDPOINTS.TRANSACTIONS.UPDATE(id), data),
    delete: (id) => api.delete(API_ENDPOINTS.TRANSACTIONS.DELETE(id)),
    search: (query) => api.get(API_ENDPOINTS.TRANSACTIONS.SEARCH, { params: query }),
    export: (format = 'csv') => api.get(API_ENDPOINTS.TRANSACTIONS.EXPORT, { 
      params: { format },
      responseType: 'blob'
    }),
  },
  
  // Category services
  categories: {
    getAll: () => api.get(API_ENDPOINTS.CATEGORIES.BASE),
    getById: (id) => api.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)),
    create: (data) => api.post(API_ENDPOINTS.CATEGORIES.CREATE, data),
    update: (id, data) => api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data),
    delete: (id) => api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id)),
  },
  
  // Analytics services
  analytics: {
    getDashboard: (params = {}) => api.get(API_ENDPOINTS.ANALYTICS.DASHBOARD, { params }),
    getTrends: (params = {}) => api.get(API_ENDPOINTS.ANALYTICS.TRENDS, { params }),
    getPatterns: (params = {}) => api.get(API_ENDPOINTS.ANALYTICS.PATTERNS, { params }),
    getBudget: (params = {}) => api.get(API_ENDPOINTS.ANALYTICS.BUDGET, { params }),
  },
  
  // Admin services
  admin: {
    getUsers: (params = {}) => api.get(API_ENDPOINTS.ADMIN.USERS, { params }),
    getStats: () => api.get(API_ENDPOINTS.ADMIN.STATS),
    updateUserRole: (id, role) => api.put(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id), { role }),
    deleteUser: (id) => api.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id)),
  }
};

export default api;
