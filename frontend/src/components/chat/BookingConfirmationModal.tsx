import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, UserCheck, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  doctor: any;
  slotStart: string;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  doctor,
  slotStart,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedDate = slotStart ? new Date(slotStart).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  const formattedTime = slotStart ? new Date(slotStart).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onConfirm(notes);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to confirm booking. Please try another slot.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Appointment</h3>
            <p className="text-xs text-slate-500">Review your clinic visit details</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Doctor & Slot Details Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Physician</p>
              <p className="text-sm font-bold text-slate-900">{doctor?.name}</p>
              <p className="text-xs text-brand-600 font-semibold">{doctor?.specialization}</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              Fee: ${doctor?.consultation_fee || '95'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-3 text-center">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
              You must sign in with a patient account to finalize this database reservation.
            </div>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="flex-1 py-2 text-xs font-bold text-center text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 py-2 text-xs font-bold text-center text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for visit / Patient notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for scheduling..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
