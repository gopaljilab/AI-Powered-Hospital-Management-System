import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  UserCheck, 
  Clock, 
  Plus, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Filter, 
  Stethoscope 
} from 'lucide-react';
import { appointmentApi, hospitalApi, adminApi } from '../../services/api';
import { Appointment, Doctor, User as UserType } from '../../types';

export const ReceptionistDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');

  // Quick Walk-in Booking State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDocId, setBookingDocId] = useState<number | ''>('');
  const [bookingPatientId, setBookingPatientId] = useState<number | ''>('');
  const [bookingSlotTime, setBookingSlotTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apps, docs, userList] = await Promise.all([
        adminApi.getAllAppointments(),
        hospitalApi.getDoctors(),
        adminApi.getUsers('patient'),
      ]);
      setAppointments(apps);
      setDoctors(docs);
      setPatients(userList);
    } catch (err) {
      console.error('Failed to load receptionist data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      await appointmentApi.updateStatus(appId, newStatus);
      setActionMessage(`Appointment #${appId} updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleCancel = async (appId: number) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentApi.cancelAppointment(appId, 'Cancelled by Front Desk Receptionist');
      setActionMessage(`Appointment #${appId} cancelled.`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  const handleWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDocId || !bookingPatientId || !bookingSlotTime) {
      alert('Please select doctor, patient, and date/time.');
      return;
    }
    try {
      // Find patient profile ID from user ID
      const patientObj = patients.find((p) => p.id === Number(bookingPatientId));
      const targetPatientId = patientObj?.patient_profile?.id || Number(bookingPatientId);

      await appointmentApi.bookAppointment({
        doctor_id: Number(bookingDocId),
        slot_start: bookingSlotTime,
        notes: bookingNotes || 'Front Desk Walk-in Booking',
        patient_id: targetPatientId,
      });

      setActionMessage('Walk-in appointment successfully booked into database!');
      setIsBookingOpen(false);
      setBookingDocId('');
      setBookingPatientId('');
      setBookingSlotTime('');
      setBookingNotes('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to book slot. Check slot availability.');
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      (app.patient?.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (app.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      app.id.toString().includes(searchQuery);

    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    const matchesDoctor = selectedDoctorFilter ? app.doctor_id.toString() === selectedDoctorFilter : true;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter((a) => a.slot_start.startsWith(todayStr));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-brand-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white border border-white/20">
            Hospital Reception & Front Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central Appointment & Queue Management
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
            Coordinate patient intake, check-in arrivals, schedule walk-ins, and inspect live doctor availability.
          </p>
        </div>

        <button
          onClick={() => setIsBookingOpen(!isBookingOpen)}
          className="px-4 py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isBookingOpen ? 'Close Booking Form' : 'Book Walk-in Patient'}</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Walk-in Booking Form Drawer */}
      {isBookingOpen && (
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-xl space-y-4 animate-slideDown">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">New On-Spot Patient Booking</h3>
            <span className="text-xs text-indigo-600 font-semibold">Database Verified</span>
          </div>

          <form onSubmit={handleWalkInBooking} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={bookingPatientId}
                onChange={(e) => setBookingPatientId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose Patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Doctor *</label>
              <select
                required
                value={bookingDocId}
                onChange={(e) => setBookingDocId(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose Doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slot Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={bookingSlotTime}
                onChange={(e) => setBookingSlotTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Walk-in symptoms, desk notes..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
              >
                Execute Database Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointment Queue Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by patient name, doctor, or booking ID..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id.toString()}>{d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading appointment queue...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No appointments matched the filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Appointment Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">#{app.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{app.patient?.user_name || 'Walk-in Patient'}</p>
                      <p className="text-[11px] text-slate-400">{app.patient?.phone || 'No phone'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{app.doctor?.name}</p>
                      <p className="text-[11px] text-indigo-600">{app.doctor?.specialization}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">
                        {new Date(app.slot_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(app.slot_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {app.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'completed')}
                            title="Mark Completed"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancel(app.id)}
                            title="Cancel Appointment"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
