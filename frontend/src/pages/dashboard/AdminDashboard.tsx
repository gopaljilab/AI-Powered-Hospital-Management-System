import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  HelpCircle, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  FileText 
} from 'lucide-react';
import { adminApi, hospitalApi } from '../../services/api';
import { DashboardStats, Doctor, User as UserType, HospitalFAQ, Department } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [faqs, setFaqs] = useState<HospitalFAQ[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'faqs' | 'audit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Add Doctor Modal State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctorData, setNewDoctorData] = useState({
    name: '',
    email: '',
    password: 'Doctor@123',
    department_id: 1,
    qualification: '',
    specialization: '',
    experience: 5,
    consultation_fee: 90,
    bio: '',
    profile_image: '',
  });

  // Add FAQ Modal State
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [newFaqData, setNewFaqData] = useState({
    question: '',
    answer: '',
    department_id: undefined as number | undefined,
  });

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, docs, userList, faqList, deptList] = await Promise.all([
        adminApi.getDashboardStats(),
        hospitalApi.getDoctors(),
        adminApi.getUsers(),
        hospitalApi.getFAQs(),
        hospitalApi.getDepartments(),
      ]);
      setStats(statsData);
      setDoctors(docs);
      setUsers(userList);
      setFaqs(faqList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleDeactivateDoctor = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) return;
    try {
      await adminApi.deactivateDoctor(id);
      setStatusMsg(`Doctor #${id} deactivated successfully.`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to deactivate');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createDoctor(newDoctorData);
      setStatusMsg(`New physician ${newDoctorData.name} created!`);
      setIsAddDoctorOpen(false);
      setNewDoctorData({
        name: '',
        email: '',
        password: 'Doctor@123',
        department_id: 1,
        qualification: '',
        specialization: '',
        experience: 5,
        consultation_fee: 90,
        bio: '',
        profile_image: '',
      });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create doctor.');
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createFAQ(newFaqData);
      setStatusMsg('New Hospital FAQ added!');
      setIsAddFaqOpen(false);
      setNewFaqData({ question: '', answer: '', department_id: undefined });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create FAQ');
    }
  };

  const handleDeleteFaq = async (id: number) => {
    try {
      await adminApi.deleteFAQ(id);
      setStatusMsg('FAQ deleted.');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete FAQ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white border border-white/20">
            Hospital System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central Management & Auditing Portal
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Live database telemetry, staff lifecycle controls, role security, and real-time activity logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddDoctorOpen(true)}
            className="px-4 py-2.5 bg-white text-purple-800 hover:bg-purple-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
          <button
            onClick={() => setIsAddFaqOpen(true)}
            className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <HelpCircle className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: 'Overview Metrics', icon: Activity },
          { key: 'doctors', label: `Doctors (${doctors.length})`, icon: Stethoscope },
          { key: 'users', label: `Users (${users.length})`, icon: Users },
          { key: 'faqs', label: `Hospital FAQs (${faqs.length})`, icon: HelpCircle },
          { key: 'audit', label: 'Audit Trail', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Patients</span>
                <Users className="w-5 h-5 text-brand-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.total_patients}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Active healthcare profiles</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Physicians</span>
                <Stethoscope className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.total_doctors}</p>
              <p className="text-[11px] text-teal-600 font-semibold">Across {departments.length} departments</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Appointments</span>
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.total_appointments}</p>
              <p className="text-[11px] text-indigo-600 font-semibold">All-time database bookings</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Today's Consultations</span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.today_appointments}</p>
              <p className="text-[11px] text-amber-600 font-semibold">Active for current date</p>
            </div>
          </div>

          {/* Department Breakdown & Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status counts */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Appointment Status Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-xl font-bold text-emerald-700">{stats.confirmed_appointments}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Confirmed</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xl font-bold text-blue-700">{stats.completed_appointments}</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Completed</p>
                </div>
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xl font-bold text-red-700">{stats.cancelled_appointments}</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase">Cancelled</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xl font-bold text-amber-700">{stats.pending_appointments}</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase">Pending</p>
                </div>
              </div>
            </div>

            {/* Department Stats */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Physicians per Department</h3>
              <div className="space-y-2.5">
                {stats.department_stats.map((depObj, idx) => {
                  const [deptName, count] = Object.entries(depObj)[0];
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="font-bold text-slate-700">{deptName}</span>
                      <span className="font-extrabold text-brand-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        {count} Doctors
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Medical Staff Directory</h3>
            <button
              onClick={() => setIsAddDoctorOpen(true)}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Doctor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Consult Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{doc.name}</p>
                      <p className="text-[11px] text-slate-400">{doc.qualification}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{doc.department?.name || 'General'}</td>
                    <td className="py-3.5 px-4 text-brand-600 font-medium">{doc.specialization}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">${doc.consultation_fee}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        doc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {doc.is_active && (
                        <button
                          onClick={() => handleDeactivateDoctor(doc.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Hospital Platform Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">#{u.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'doctor' ? 'bg-teal-100 text-teal-800' :
                        u.role === 'receptionist' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FAQS */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Hospital Knowledge Base & Assistant FAQs</h3>
            <button
              onClick={() => setIsAddFaqOpen(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">Q: {faq.question}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && stats && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Database Audit Trail (Recent Activity)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_activity.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">#{log.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.actor_name || 'System'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">{log.entity} #{log.entity_id || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{log.details || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCTOR */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add New Doctor to Staff</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Gregory House, MD"
                  value={newDoctorData.name}
                  onChange={(e) => setNewDoctorData({ ...newDoctorData, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospitalx.org"
                    value={newDoctorData.email}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDoctorData.department_id}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, department_id: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualification *</label>
                  <input
                    type="text"
                    required
                    placeholder="MD - Nephrology"
                    value={newDoctorData.qualification}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, qualification: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="Diagnostics & Internal Medicine"
                    value={newDoctorData.specialization}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, specialization: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newDoctorData.experience}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, experience: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={newDoctorData.consultation_fee}
                    onChange={(e) => setNewDoctorData({ ...newDoctorData, consultation_fee: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Biography</label>
                <textarea
                  rows={2}
                  placeholder="Doctor's background and achievements..."
                  value={newDoctorData.bio}
                  onChange={(e) => setNewDoctorData({ ...newDoctorData, bio: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                >
                  Save & Assign Default Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FAQ */}
      {isAddFaqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New FAQ Item</h3>
            <form onSubmit={handleCreateFaq} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What are the ICU visiting hours?"
                  value={newFaqData.question}
                  onChange={(e) => setNewFaqData({ ...newFaqData, question: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Answer *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Clear, helpful response for patients and the AI assistant..."
                  value={newFaqData.answer}
                  onChange={(e) => setNewFaqData({ ...newFaqData, answer: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddFaqOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                >
                  Publish FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
