export type Role = 'patient' | 'doctor' | 'receptionist' | 'admin';

export interface PatientProfile {
  id: number;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  patient_profile?: PatientProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  doctor_count: number;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  weekday: number; // 0=Mon, 6=Sun
  start_time: string;
  end_time: string;
  slot_duration: number;
}

export interface ScheduleException {
  id: number;
  doctor_id: number;
  date: string;
  reason?: string;
}

export interface Doctor {
  id: number;
  user_id: number;
  department_id?: number;
  name: string;
  qualification: string;
  specialization: string;
  experience: number;
  consultation_fee: number;
  profile_image?: string;
  bio?: string;
  is_active: boolean;
  department?: {
    id: number;
    name: string;
  };
  schedules?: DoctorSchedule[];
  exceptions?: ScheduleException[];
}

export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
  formatted_time: string;
  is_available: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  slot_start: string;
  slot_end: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  doctor?: {
    id: number;
    name: string;
    specialization: string;
    qualification: string;
    consultation_fee: number;
    profile_image?: string;
  };
  patient?: {
    id: number;
    phone?: string;
    user_name?: string;
    user_email?: string;
  };
}

export interface HospitalFAQ {
  id: number;
  question: string;
  answer: string;
  department_id?: number;
  department_name?: string;
}

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_call_data?: any;
  created_at?: string;
}

export interface AuditLog {
  id: number;
  actor_id?: number;
  actor_name?: string;
  action: string;
  entity: string;
  entity_id?: number;
  details?: string;
  created_at: string;
}

export interface DashboardStats {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  today_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  completed_appointments: number;
  department_stats: Record<string, number>[];
  recent_activity: AuditLog[];
}
