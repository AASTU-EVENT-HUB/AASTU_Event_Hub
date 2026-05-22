import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests if it exists
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
};

// ─────────────────────────────────────────────────────────────────────────────
// Events APIs
// ─────────────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: () => apiClient.get('/events'),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Registration APIs
// ─────────────────────────────────────────────────────────────────────────────
export const registrationAPI = {
  registerForEvent: (eventId) =>
    apiClient.post(`/registrations/${eventId}`),
  getMyRegistrations: () => apiClient.get('/registrations'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Notifications APIs
// ─────────────────────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}`, { read: true }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Proposals APIs
// ─────────────────────────────────────────────────────────────────────────────
export const proposalsAPI = {
  create: (data) => apiClient.post('/proposals', data),
  getAll: () => apiClient.get('/proposals'),
  approve: (id) => apiClient.put(`/proposals/${id}/approve`),
  reject: (id) => apiClient.put(`/proposals/${id}/reject`),
};

export default apiClient;
