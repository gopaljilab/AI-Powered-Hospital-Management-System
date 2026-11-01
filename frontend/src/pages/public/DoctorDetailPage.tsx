import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  Star, 
  Award, 
  CheckCircle, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  CalendarDays 
} from 'lucide-react';
import { hospitalApi, appointmentApi } from '../../services/api';
import { Doctor, AvailableSlot } from '../../types';
import { BookingConfirmationModal } from '../../components/chat/BookingConfirmationModal';
import { useAuth } from '../../context/AuthContext';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // Default to tomorrow or today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [bookingModalState, setBookingModalState] = useState<{
    isOpen: boolean;
    slotStart: string;
  }>({
    isOpen: false,
    slotStart: '',
  });

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const doc = await hospitalApi.getDoctor(Number(id));
        setDoctor(doc);
      } catch (err) {
        console.error('Failed to fetch doctor:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      setIsSlotsLoading(true);
      try {
        const slotData = await hospitalApi.getDoctorSlots(Number(id), selectedDate);
        setSlots(slotData);
      } catch (err) {
        console.error('Failed to fetch slots:', err);
        setSlots([]);
      } finally {
        setIsSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleConfirmBooking = async (notes: string) => {
    if (!doctor || !bookingModalState.slotStart) return;

    const res = await appointmentApi.bookAppointment({
      doctor_id: doctor.id,
      slot_start: bookingModalState.slotStart,
      notes,
    });

    setBookingSuccess(
      `Appointment #${res.id} confirmed for ${new Date(res.slot_start).toLocaleString()}! You can manage this from your Patient Dashboard.`
    );

    // Refresh slots
    const updatedSlots = await hospitalApi.getDoctorSlots(doctor.id, selectedDate);
    setSlots(updatedSlots);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Doctor Profile Not Found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Return to Doctors Directory
        </button>
      </div>
    );
  }

  // Generate quick next 7 days pills
  const nextDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx + 1);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    return { dateStr, dayName, dayNum };
  });

  const availableSlots = slots.filter((s) => s.is_available);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/doctors')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </button>

      {bookingSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/patient')}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold shrink-0 text-[11px]"
          >
            View in Dashboard
          </button>
        </div>
      )}

      {/* Profile Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Doctor Bio & Credentials */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start space-x-4">
            <img
              src={doctor.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'}
              alt={doctor.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-100 shadow-md shrink-0"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                {doctor.department?.name || 'General Specialty'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{doctor.name}</h1>
              <p className="text-xs font-bold text-brand-600">{doctor.specialization}</p>
              <p className="text-xs text-slate-400 mt-0.5">{doctor.qualification}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Experience</p>
              <p className="text-sm font-extrabold text-slate-900">{doctor.experience} Years</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Rating</p>
              <p className="text-sm font-extrabold text-amber-500 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Consult Fee</p>
              <p className="text-sm font-extrabold text-emerald-600">${doctor.consultation_fee}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Biography</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {doctor.bio || 'Compassionate physician dedicated to comprehensive patient health, advanced diagnostics, and individualized therapy plans.'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hospital Board Certified Practitioner</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Standard 30-Minute Thorough Consultations</span>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Schedule & Slot Selection */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-brand-600" />
              <span>Available Appointment Slots</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your preferred appointment date to retrieve real-time schedule openings.
            </p>
          </div>

          {/* Quick Date Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Choose Date</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {nextDays.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`p-2.5 rounded-2xl text-center transition-all border ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/30 scale-105'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold tracking-wider">{d.dayName}</p>
                    <p className="text-base font-extrabold mt-0.5">{d.dayNum}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots View */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Open Slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {availableSlots.length} Open
              </span>
            </div>

            {isSlotsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Calculating available doctor slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Open Slots on this Date</p>
                <p className="text-[11px] text-slate-500">
                  The doctor is either off-duty, fully booked, or has registered a leave exception. Please select another date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBookingModalState({ isOpen: true, slotStart: slot.slot_start })}
                    className="p-3 bg-slate-50 hover:bg-brand-50 hover:border-brand-400 border border-slate-200/90 rounded-2xl text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700 block">
                        {slot.formatted_time.split('-')[0].trim()}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-brand-600 font-medium">
                        30 Min Consult
                      </span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <BookingConfirmationModal
        isOpen={bookingModalState.isOpen}
        doctor={doctor}
        slotStart={bookingModalState.slotStart}
        onClose={() => setBookingModalState({ isOpen: false, slotStart: '' })}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};
