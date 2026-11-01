import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogIn, Lock, Mail, AlertCircle, Shield, User, Stethoscope, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Navigate to role-specific dashboard
        if (loggedUser.role === 'doctor') navigate('/dashboard/doctor');
        else if (loggedUser.role === 'receptionist') navigate('/dashboard/receptionist');
        else if (loggedUser.role === 'admin') navigate('/dashboard/admin');
        else navigate('/dashboard/patient');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Incorrect email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass)
      .then((loggedUser) => {
        if (loggedUser.role === 'doctor') navigate('/dashboard/doctor');
        else if (loggedUser.role === 'receptionist') navigate('/dashboard/receptionist');
        else if (loggedUser.role === 'admin') navigate('/dashboard/admin');
        else navigate('/dashboard/patient');
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Login failed.');
      });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Portal Login</h2>
          <p className="text-xs text-slate-500">Sign in to manage appointments, schedules, or records</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospitalx.org"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Quick-Login Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Demo Roles
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('patient@hospitalx.org', 'Patient@123')}
              className="p-2.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">Patient Demo</span>
            </button>
            <button
              onClick={() => handleQuickLogin('dr.sarah@hospitalx.org', 'Doctor@123')}
              className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 transition-colors text-left"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">Doctor Demo</span>
            </button>
            <button
              onClick={() => handleQuickLogin('receptionist@hospitalx.org', 'Recep@123')}
              className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 transition-colors text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Receptionist Demo</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin@hospitalx.org', 'Admin@123')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-slate-700 font-semibold flex items-center gap-1.5 transition-colors text-left"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Register Footer */}
        <div className="text-center text-xs text-slate-500 pt-2">
          New patient?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
