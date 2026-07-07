import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edutrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('edutrack_token');
      localStorage.removeItem('edutrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// ─── Students ─────────────────────────────────────────────────────────────────
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
  enroll: (id, courseId) => api.post(`/students/${id}/enroll`, { courseId }),
  getAttendance: (id) => api.get(`/students/${id}/attendance`),
};

// ─── Lecturers ────────────────────────────────────────────────────────────────
export const lecturersAPI = {
  getAll: (params) => api.get('/lecturers', { params }),
  getById: (id) => api.get(`/lecturers/${id}`),
  create: (data) => api.post('/lecturers', data),
  update: (id, data) => api.put(`/lecturers/${id}`, data),
  remove: (id) => api.delete(`/lecturers/${id}`),
  assignCourse: (id, courseId) => api.post(`/lecturers/${id}/assign-course`, { courseId }),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  remove: (id) => api.delete(`/courses/${id}`),
};

// ─── Classes / Timetable ──────────────────────────────────────────────────────
export const classesAPI = {
  getAll: (params) => api.get('/classes', { params }),
  create: (data) => api.post('/classes', data),
  remove: (id) => api.delete(`/classes/${id}`),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceAPI = {
  startSession: (data) => api.post('/attendance/start-session', data),
  closeSession: (sessionId) => api.post(`/attendance/session/${sessionId}/close`),
  refreshQR: (sessionId) => api.get(`/attendance/session/${sessionId}/qr`),
  getSession: (sessionId) => api.get(`/attendance/session/${sessionId}`),
  mark: (data) => api.post('/attendance/mark', data),
  markByLecturer: (sessionId, studentId, status) => api.post(`/attendance/session/${sessionId}/mark`, { studentId, status }),
  editRecord: (id, data) => api.put(`/attendance/${id}`, data),
  getHistory: (params) => api.get('/attendance/history', { params }),
  getStudentHistory: (userId, params) => api.get(`/attendance/student/${userId}`, { params }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  records: (params) => api.get('/reports/records', { params }),
  daily: (params) => api.get('/reports/daily', { params }),
  weekly: (params) => api.get('/reports/weekly', { params }),
  monthly: (params) => api.get('/reports/monthly', { params }),
  student: (studentId) => api.get(`/reports/student/${studentId}`),
  lowAttendance: (threshold) => api.get('/reports/low-attendance', { params: { threshold } }),
  exportPDF: (type, params) => api.get(`/reports/export/pdf/${type}`, { params, responseType: 'blob' }),
  exportExcel: (type, params) => api.get(`/reports/export/excel/${type}`, { params, responseType: 'blob' }),
  exportCSV: (type, params) => api.get(`/reports/export/csv/${type}`, { params, responseType: 'blob' }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  send: (data) => api.post('/notifications/send', data),
  sendWarnings: (threshold) => api.post('/notifications/send-warnings', { threshold }),
  remove: (id) => api.delete(`/notifications/${id}`),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditAPI = {
  getLogs: (params) => api.get('/logs', { params }),
  getSecurity: (params) => api.get('/logs/security', { params }),
  getActivity: (params) => api.get('/logs/activity', { params }),
};

/** Download a blob response as a file */
export const downloadBlob = (data, filename) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default api;
