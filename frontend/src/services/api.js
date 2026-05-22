import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-inject JWT token from localStorage into every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aastu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth APIs
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  googleLogin: () => {
    // Redirect browser to backend Google OAuth flow
    window.location.href = `${API_BASE}/auth/google`;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Events APIs
// ─────────────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params = {}) => apiClient.get('/events', { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Registration APIs
// ─────────────────────────────────────────────────────────────────────────────
export const registrationAPI = {
  registerForEvent: (eventId) => apiClient.post(`/registrations/${eventId}`),
  getMyRegistrations: () => apiClient.get('/registrations'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Notifications APIs
// ─────────────────────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  create: (data) => apiClient.post('/notifications', data),
  markRead: (id) => apiClient.post(`/notifications/${id}/read`),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Proposals APIs
// ─────────────────────────────────────────────────────────────────────────────
export const proposalsAPI = {
  getAll: () => apiClient.get('/proposals'),
  create: (data) => apiClient.post('/proposals', data),
  update: (id, data) => apiClient.put(`/proposals/${id}`, data),
  delete: (id) => apiClient.delete(`/proposals/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Check-in APIs
// ─────────────────────────────────────────────────────────────────────────────
export const checkinAPI = {
  scan: (qrData, eventId) => apiClient.post('/checkin/scan', { qrData, eventId }),
  getStats: (eventId) => apiClient.get(`/checkin/${eventId}/stats`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Analytics APIs
// ─────────────────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getAdmin: () => apiClient.get('/analytics/admin'),
  getStudent: () => apiClient.get('/analytics/student'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Users APIs (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params = {}) => apiClient.get('/users', { params }),
  updateRole: (id, role) => apiClient.put(`/users/${id}/role`, { role }),
  delete: (id) => apiClient.delete(`/users/${id}`),
};

export default apiClient;
