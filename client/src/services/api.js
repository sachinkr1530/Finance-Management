import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  deleteAccount: () => api.delete('/auth/account'),
};

// Expense APIs
export const expenseAPI = {
  add: (data) => api.post('/expenses/add', data),
  getAll: (params) => api.get('/expenses/all', { params }),
  update: (id, data) => api.put(`/expenses/update/${id}`, data),
  delete: (id) => api.delete(`/expenses/delete/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params }),
};

// Goal APIs
export const goalAPI = {
  create: (data) => api.post('/goals/create', data),
  getAll: (params) => api.get('/goals/all', { params }),
  update: (id, data) => api.put(`/goals/update/${id}`, data),
  delete: (id) => api.delete(`/goals/delete/${id}`),
  addSavings: (id, data) => api.post(`/goals/add-savings/${id}`, data),
};

// Salary APIs
export const salaryAPI = {
  add: (data) => api.post('/salary/add', data),
  getHistory: (params) => api.get('/salary/history', { params }),
  delete: (id) => api.delete(`/salary/delete/${id}`),
};

// Subscription APIs
export const subscriptionAPI = {
  create: (data) => api.post('/subscriptions/create', data),
  getAll: (params) => api.get('/subscriptions/all', { params }),
  update: (id, data) => api.put(`/subscriptions/update/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/delete/${id}`),
};

// AI APIs
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  analyze: (data) => api.post('/ai/analyze', data),
};

// Analytics APIs
export const analyticsAPI = {
  getMonthly: (params) => api.get('/analytics/monthly', { params }),
  getHealthScore: () => api.get('/analytics/health-score'),
  getPredictions: () => api.get('/analytics/predictions'),
};

// Notification APIs
export const notificationAPI = {
  getAll: (params) => api.get('/notifications/all', { params }),
  markRead: () => api.put('/notifications/mark-read'),
  delete: (id) => api.delete(`/notifications/delete/${id}`),
};

export default api;
