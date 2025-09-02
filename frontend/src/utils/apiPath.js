import axios from 'axios';

// Base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
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
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  
  // Transaction endpoints
  TRANSACTIONS: {
    BASE: '/api/transactions',
    CREATE: '/api/transactions',
    UPDATE: (id) => `/api/transactions/${id}`,
    DELETE: (id) => `/api/transactions/${id}`,
    GET_BY_ID: (id) => `/api/transactions/${id}`,
    SEARCH: '/api/transactions/search',
    EXPORT: '/api/transactions/export',
  },
  
  // Category endpoints
  CATEGORIES: {
    BASE: '/api/categories',
    CREATE: '/api/categories',
    UPDATE: (id) => `/api/categories/${id}`,
    DELETE: (id) => `/api/categories/${id}`,
    GET_BY_ID: (id) => `/api/categories/${id}`,
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    TRENDS: '/api/analytics/trends',
    PATTERNS: '/api/analytics/patterns',
    BUDGET: '/api/analytics/budget',
  },
  
  // Admin endpoints
  ADMIN: {
    USERS: '/api/admin/users',
    STATS: '/api/admin/stats',
    UPDATE_USER_ROLE: (id) => `/api/admin/users/${id}/role`,
    DELETE_USER: (id) => `/api/admin/users/${id}`,
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
