import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  CalendarDays, 
  Phone, 
  Mail, 
  AlertCircle, 
  Stethoscope, 
  ChevronRight 
} from 'lucide-react';
import { appointmentApi, hospitalApi } from '../../services/api';
import { Appointment, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'all'>('today');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentApi.getMyAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      await appointmentApi.updateStatus(appId, newStatus);
      setStatusMessage(`Appointment #${appId} updated to ${newStatus}`);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.slot_start.startsWith(todayStr));
  const displayedAppointments = selectedDateFilter === 'today' ? todayAppointments : appointments;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-brand-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white border border-white/20">
            Clinical Practitioner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user?.name}'s Clinic Schedule
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Review patient appointments, consult records, and manage daily consultation statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/20 text-xs">
          <div className="text-center px-3 border-r border-white/20">
            <p className="text-xl font-black">{todayAppointments.length}</p>
            <p className="text-[10px] text-teal-200 uppercase font-bold">Today's Queue</p>
          </div>
          <div className="text-center px-3">
            <p className="text-xl font-black">{appointments.filter(a => a.status === 'confirmed').length}</p>
            <p className="text-[10px] text-teal-200 uppercase font-bold">Total Confirmed</p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Patient Consultations Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage upcoming and completed consultations.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDateFilter('today')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedDateFilter === 'today'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Today Only ({todayAppointments.length})
              </button>
              <button
                onClick={() => setSelectedDateFilter('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedDateFilter === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Bookings ({appointments.length})
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading appointment schedule...</div>
          ) : displayedAppointments.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No appointments scheduled for this period.</p>
              <p className="text-[11px] text-slate-400">Open slots remain available for patient booking.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAppointments.map((app) => {
                const startTime = new Date(app.slot_start);
                const isToday = app.slot_start.startsWith(todayStr);

                return (
                  <div
                    key={app.id}
                    className="p-5 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/90 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {app.patient?.user_name ? app.patient.user_name.charAt(0) : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {app.patient?.user_name || 'Registered Patient'}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            {app.patient?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {app.patient.phone}
                              </span>
                            )}
                            {app.patient?.user_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" /> {app.patient.user_email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                        <p className="text-xs font-bold text-slate-900">
                          {startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-brand-600 font-extrabold flex items-center sm:justify-end gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                        </p>
                      </div>
                    </div>

                    {app.notes && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600">
                        <strong className="text-slate-800">Visit Reason:</strong> {app.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2">
                      {app.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'completed')}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                            className="px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 bg-white border border-red-200 rounded-xl transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel Visit
                          </button>
                        </>
                      )}
                      {app.status === 'completed' && (
                        <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Consultation Finished
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
