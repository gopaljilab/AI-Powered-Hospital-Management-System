import React from 'react';
import { Doctor } from '../../types';
import { Star, Clock, Calendar, CheckCircle } from 'lucide-react';

interface DoctorCardProps {
  doctor: Partial<Doctor> & {
    id: number;
    name: string;
    specialization: string;
    department?: string | { id: number; name: string };
    experience?: string | number;
    consultation_fee?: string | number;
    profile_image?: string;
  };
  onSelectSlot?: (doctor: any) => void;
  onBookNow?: (doctor: any) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelectSlot, onBookNow }) => {
  const deptName = typeof doctor.department === 'string' ? doctor.department : doctor.department?.name;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start space-x-3.5">
        <img
          src={doctor.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
          alt={doctor.name}
          className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 truncate">{doctor.name}</h4>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {typeof doctor.consultation_fee === 'number' ? `$${doctor.consultation_fee}` : doctor.consultation_fee}
            </span>
          </div>
          <p className="text-xs font-semibold text-brand-600 truncate">{doctor.specialization}</p>
          {deptName && (
            <p className="text-[11px] text-slate-500 mt-0.5">{deptName}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {doctor.experience ? `${doctor.experience} exp` : 'Experienced'}
            </span>
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
        {onSelectSlot && (
          <button
            onClick={() => onSelectSlot(doctor)}
            className="flex-1 py-1.5 px-3 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Check Slots</span>
          </button>
        )}
        {onBookNow && (
          <button
            onClick={() => onBookNow(doctor)}
            className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/20 transition-all flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Select Doctor</span>
          </button>
        )}
      </div>
    </div>
  );
};
