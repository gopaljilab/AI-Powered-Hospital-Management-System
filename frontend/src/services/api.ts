import axios from 'axios';
import {
  AuthResponse,
  User,
  Department,
  Doctor,
  AvailableSlot,
  Appointment,
  HospitalFAQ,
  ChatMessage,
  DashboardStats,
  AuditLog
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hospitalx_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear on failed login attempt
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('hospitalx_token');
        localStorage.removeItem('hospitalx_user');
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData: any): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// --- Hospital & Doctor Directory APIs ---
export const hospitalApi = {
  getDepartments: async (): Promise<Department[]> => {
    const res = await api.get('/departments');
    return res.data;
  },
  getDepartment: async (id: number): Promise<Department> => {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
  getDoctors: async (params?: { department_id?: number; search?: string; specialization?: string }): Promise<Doctor[]> => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },
  getDoctor: async (id: number): Promise<Doctor> => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },
  getDoctorSlots: async (doctorId: number, dateStr: string): Promise<AvailableSlot[]> => {
    const res = await api.get(`/doctors/${doctorId}/slots`, {
      params: { date: dateStr },
    });
    return res.data;
  },
  getFAQs: async (): Promise<HospitalFAQ[]> => {
    const res = await api.get('/admin/faqs');
    return res.data;
  },
};

// --- Appointments APIs ---
export const appointmentApi = {
  bookAppointment: async (payload: { doctor_id: number; slot_start: string; notes?: string; patient_id?: number }): Promise<Appointment> => {
    const { patient_id, ...body } = payload;
    const res = await api.post('/appointments', body, {
      params: patient_id ? { patient_id } : undefined,
    });
    return res.data;
  },
  getMyAppointments: async (status?: string): Promise<Appointment[]> => {
    const res = await api.get('/appointments/me', { params: { status } });
    return res.data;
  },
  cancelAppointment: async (id: number, reason?: string): Promise<Appointment> => {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },
  rescheduleAppointment: async (id: number, newSlotStart: string): Promise<Appointment> => {
    const res = await api.patch(`/appointments/${id}/reschedule`, { new_slot_start: newSlotStart });
    return res.data;
  },
  updateStatus: async (id: number, newStatus: string): Promise<Appointment> => {
    const res = await api.patch(`/appointments/${id}/status`, null, {
      params: { new_status: newStatus },
    });
    return res.data;
  },
};

// --- Chatbot APIs ---
export const chatApi = {
  sendMessage: async (message: string, conversationId?: number): Promise<{
    conversation_id: number;
    reply: string;
    tool_call_data?: any;
    suggested_prompts?: string[];
  }> => {
    const res = await api.post('/chat/messages', {
      message,
      conversation_id: conversationId,
    });
    return res.data;
  },
  getConversations: async () => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },
  getMessages: async (conversationId: number) => {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`);
    return res.data;
  },
};

// --- Admin APIs ---
export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getUsers: async (role?: string): Promise<User[]> => {
    const res = await api.get('/admin/users', { params: { role } });
    return res.data;
  },
  createDoctor: async (data: any): Promise<Doctor> => {
    const res = await api.post('/admin/doctors', data);
    return res.data;
  },
  updateDoctor: async (id: number, data: any): Promise<Doctor> => {
    const res = await api.put(`/admin/doctors/${id}`, data);
    return res.data;
  },
  deactivateDoctor: async (id: number) => {
    const res = await api.delete(`/admin/doctors/${id}`);
    return res.data;
  },
  createDepartment: async (data: any): Promise<Department> => {
    const res = await api.post('/admin/departments', data);
    return res.data;
  },
  getAllAppointments: async (params?: { doctor_id?: number; status?: string }): Promise<Appointment[]> => {
    const res = await api.get('/admin/appointments', { params });
    return res.data;
  },
  getAuditLogs: async (limit: number = 50): Promise<AuditLog[]> => {
    const res = await api.get('/admin/audit-logs', { params: { limit } });
    return res.data;
  },
  createFAQ: async (data: { question: string; answer: string; department_id?: number }): Promise<HospitalFAQ> => {
    const res = await api.post('/admin/faqs', data);
    return res.data;
  },
  deleteFAQ: async (id: number) => {
    const res = await api.delete(`/admin/faqs/${id}`);
    return res.data;
  },
};
