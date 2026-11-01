import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Heart, 
  AlertCircle, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Plus, 
  Check, 
  ShieldAlert 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentApi, hospitalApi } from '../../services/api';
import { Appointment, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleAppId, setRescheduleAppId] = useState<number | null>(null);
  const [newSlotTime, setNewSlotTime] = useState('');

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentApi.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? The slot will be released.')) return;
    try {
      await appointmentApi.cancelAppointment(id, 'Patient requested cancellation from dashboard');
      setActionMessage(`Appointment #${id} successfully cancelled.`);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel appointment.');
    }
  };

  const handleReschedule = async (id: number) => {
    if (!newSlotTime) return;
    try {
      await appointmentApi.rescheduleAppointment(id, newSlotTime);
      setActionMessage(`Appointment #${id} successfully rescheduled.`);
      setRescheduleAppId(null);
      setNewSlotTime('');
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reschedule. Slot might be taken or in the past.');
    }
  };

  const upcoming = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed');
  const past = appointments.filter((a) => a.status === 'cancelled' || a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white border border-white/20">
            Patient Medical Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
            Manage your medical appointments, explore certified specialists, or speak with our AI Assistant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/doctors"
            className="px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
          <Link
            to="/assistant"
            className="px-4 py-2.5 bg-brand-700/60 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold text-emerald-700">✕</button>
        </div>
      )}

      {/* Grid: Patient Details & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Patient Profile Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Phone</span>
              <span className="text-slate-800 font-bold">{user?.patient_profile?.phone || 'Not recorded'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Blood Group</span>
              <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded">
                {user?.patient_profile?.blood_group || 'O+'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Gender</span>
              <span className="text-slate-800 font-semibold">{user?.patient_profile?.gender || 'Unspecified'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Emergency Contact</span>
              <span className="text-slate-800 font-semibold text-right max-w-[180px] truncate">
                {user?.patient_profile?.emergency_contact || 'None registered'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500">
            Need to update your clinical medical record? Contact our front desk reception.
          </div>
        </div>

        {/* Right Column: Appointments List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Upcoming Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <span>Upcoming Scheduled Appointments ({upcoming.length})</span>
              </h2>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your appointments...</div>
            ) : upcoming.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No upcoming appointments found</p>
                <Link
                  to="/doctors"
                  className="inline-block px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                >
                  Schedule an Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            Dr. {app.doctor?.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-brand-600 font-semibold">{app.doctor?.specialization}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-slate-800">
                          {new Date(app.slot_start).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(app.slot_start).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </p>
                      </div>
                    </div>

                    {app.notes && (
                      <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
                        <strong>Notes:</strong> {app.notes}
                      </p>
                    )}

                    {/* Reschedule inline form */}
                    {rescheduleAppId === app.id ? (
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                        <input
                          type="datetime-local"
                          value={newSlotTime}
                          onChange={(e) => setNewSlotTime(e.target.value)}
                          className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleReschedule(app.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                          Confirm Reschedule
                        </button>
                        <button
                          onClick={() => setRescheduleAppId(null)}
                          className="px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setRescheduleAppId(app.id);
                            setNewSlotTime('');
                          }}
                          className="px-3 py-1 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 bg-white border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / History Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Appointment History</h2>
            {past.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No historical or cancelled appointments on record.</p>
            ) : (
              <div className="space-y-2">
                {past.map((app) => (
                  <div
                    key={app.id}
                    className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-700">Dr. {app.doctor?.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(app.slot_start).toLocaleDateString()} at{' '}
                        {new Date(app.slot_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      app.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
