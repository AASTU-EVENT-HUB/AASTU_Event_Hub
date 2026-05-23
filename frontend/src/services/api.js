import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aastu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  googleLogin: () => { window.location.href = `${API_BASE}/auth/google`; },
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params = {}) => apiClient.get('/events', { params }),
  getById: (id) => apiClient.get(`/events/${id}`),
  create: (data) => apiClient.post('/events', data),
  update: (id, data) => apiClient.put(`/events/${id}`, data),
  delete: (id) => apiClient.delete(`/events/${id}`),
  approve: (id) => apiClient.patch(`/events/${id}/approve`),
  reject: (id, reason) => apiClient.patch(`/events/${id}/reject`, { reason }),
};

// ── Registrations ─────────────────────────────────────────────────────────────
export const registrationAPI = {
  registerForEvent: (eventId) => apiClient.post(`/registrations/${eventId}`),
  getMyRegistrations: () => apiClient.get('/registrations'),
  getAll: () => apiClient.get('/registrations/all'),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  create: (data) => apiClient.post('/notifications', data),
  markRead: (id) => apiClient.post(`/notifications/${id}/read`),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getAdmin: () => apiClient.get('/analytics/admin'),
  getStudent: () => apiClient.get('/analytics/student'),
  getOrganizer: () => apiClient.get('/organizer/analytics'),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params = {}) => apiClient.get('/users', { params }),
  updateRole: (id, role) => apiClient.put(`/users/${id}/role`, { role }),
  delete: (id) => apiClient.delete(`/users/${id}`),
  suspend: (id, suspended) => apiClient.patch(`/users/${id}/suspend`, { suspended }),
  updateAvatar: (avatar) => apiClient.patch('/users/me/avatar', { avatar }),
  updateProfile: (data) => apiClient.patch('/users/me', data),
};

// ── Organizer ─────────────────────────────────────────────────────────────────
export const organizerAPI = {
  apply: (data) => apiClient.post('/organizer/apply', data),
  getApplicationStatus: () => apiClient.get('/organizer/apply/status'),
  getMyEvents: () => apiClient.get('/organizer/events'),
  getRegistrations: (eventId) => apiClient.get('/organizer/registrations', { params: eventId ? { eventId } : {} }),
  getCheckinList: (eventId) => apiClient.get(`/organizer/checkin/${eventId}`),
  manualCheckin: (eventId, registrationId) => apiClient.patch(`/organizer/checkin/${eventId}/${registrationId}`),
  scanQR: (eventId, qrData) => apiClient.post(`/organizer/scanner/${eventId}`, { qrData }),
  getAnalytics: () => apiClient.get('/organizer/analytics'),
  getFeedback: () => apiClient.get('/organizer/feedback'),
  getThresholdSuggestions: () => apiClient.get('/organizer/suggestions'),
  claimSuggestion: (id) => apiClient.post(`/organizer/suggestions/${id}/claim`),
};

// ── Admin: organizer applications ─────────────────────────────────────────────
export const adminOrganizerAPI = {
  getApplications: (status = 'pending') => apiClient.get('/organizer/admin/applications', { params: { status } }),
  approve: (id) => apiClient.patch(`/organizer/admin/applications/${id}/approve`),
  reject: (id, reason) => apiClient.patch(`/organizer/admin/applications/${id}/reject`, { reason }),
};

// ── Suggestions ───────────────────────────────────────────────────────────────
export const suggestionsAPI = {
  getAll: () => apiClient.get('/suggestions'),
  create: (data) => apiClient.post('/suggestions', data),
  upvote: (id) => apiClient.post(`/suggestions/${id}/upvote`),
  delete: (id) => apiClient.delete(`/suggestions/${id}`),
};

// ── Feedback ──────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => apiClient.post('/feedback', data),
  getMine: () => apiClient.get('/feedback/mine'),
  getAdmin: () => apiClient.get('/feedback/admin'),
  hide: (id) => apiClient.patch(`/feedback/admin/${id}/hide`),
};

// ── Proposals (legacy — kept for ProposeEventPage & AdminApprovalPage) ────────
export const proposalsAPI = {
  getAll: () => apiClient.get('/proposals'),
  create: (data) => apiClient.post('/proposals', data),
  update: (id, data) => apiClient.put(`/proposals/${id}`, data),
  delete: (id) => apiClient.delete(`/proposals/${id}`),
};

// ── Check-in (admin legacy) ───────────────────────────────────────────────────
export const checkinAPI = {
  scan: (qrData, eventId) => apiClient.post('/checkin/scan', { qrData, eventId }),
  getStats: (eventId) => apiClient.get(`/checkin/${eventId}/stats`),
};

export default apiClient;
