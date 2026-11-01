import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface SlotItem {
  slot_start: string;
  slot_end: string;
  time: string;
  is_available: boolean;
}

interface SlotPickerProps {
  doctorName?: string;
  specialization?: string;
  dateStr?: string;
  slots: SlotItem[];
  onSelectSlot: (slot: SlotItem) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  doctorName,
  specialization,
  dateStr,
  slots,
  onSelectSlot,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  const availableSlots = slots.filter((s) => s.is_available);

  const handleConfirm = () => {
    if (selectedSlot) {
      onSelectSlot(selectedSlot);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 my-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          {doctorName && (
            <h4 className="text-xs font-bold text-slate-800">
              Slots for {doctorName} {specialization && <span className="text-slate-500 font-normal">({specialization})</span>}
            </h4>
          )}
          <p className="text-[11px] text-brand-600 flex items-center gap-1 mt-0.5 font-medium">
            <Calendar className="w-3 h-3" />
            <span>Target Date: {dateStr || 'Available Times'}</span>
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
          {availableSlots.length} Open
        </span>
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500">
          No open slots remain for this date. Please check another weekday.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {availableSlots.map((slot, idx) => {
              const isSelected = selectedSlot?.slot_start === slot.slot_start;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/30'
                      : 'bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border-slate-200/80 hover:border-brand-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Clock className={`w-3 h-3 ${isSelected ? 'text-brand-100' : 'text-slate-400'}`} />
                    {slot.time.split('-')[0].trim()}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Selected: <strong className="text-brand-700">{selectedSlot.time}</strong>
              </span>
              <button
                onClick={handleConfirm}
                className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
              >
                Proceed to Book
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
