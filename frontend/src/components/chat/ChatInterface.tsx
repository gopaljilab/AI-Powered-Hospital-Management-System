import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  PhoneCall, 
  Stethoscope 
} from 'lucide-react';
import { chatApi, appointmentApi } from '../../services/api';
import { DoctorCard } from './DoctorCard';
import { SlotPicker } from './SlotPicker';
import { BookingConfirmationModal } from './BookingConfirmationModal';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_call_data?: any;
  created_at?: string;
}

interface ChatInterfaceProps {
  initialPrompt?: string;
  isDrawer?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialPrompt, isDrawer = false }) => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your **Hospital Assistant**. I can help you search specialist doctors, find open consultation slots, book or reschedule appointments, and answer any hospital questions.\n\nHow can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Find a doctor",
    "Book an appointment",
    "Check my appointments",
    "Hospital visiting hours",
    "Available departments"
  ]);

  // Modal State for slot confirmation
  const [bookingModalState, setBookingModalState] = useState<{
    isOpen: boolean;
    doctor: any;
    slotStart: string;
  }>({
    isOpen: false,
    doctor: null,
    slotStart: '',
  });

  // Reference strictly to the scrollable message container to prevent page viewport jumping
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(text.trim(), conversationId);
      setConversationId(response.conversation_id);

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        tool_call_data: response.tool_call_data,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.suggested_prompts && response.suggested_prompts.length > 0) {
        setSuggestedPrompts(response.suggested_prompts);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I am having temporary trouble reaching the medical scheduling service. You can browse our Doctors Directory or try asking again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectDoctorForSlots = (doc: any) => {
    handleSendMessage(`What are the available slots for Dr. ${doc.name}?`);
  };

  const handleSelectSlot = (doctor: any, slot: any) => {
    setBookingModalState({
      isOpen: true,
      doctor: doctor || { name: 'Specialist Physician', consultation_fee: 95 },
      slotStart: slot.slot_start,
    });
  };

  const handleConfirmBooking = async (notes: string) => {
    if (!bookingModalState.doctor || !bookingModalState.slotStart) return;

    const res = await appointmentApi.bookAppointment({
      doctor_id: bookingModalState.doctor.id,
      slot_start: bookingModalState.slotStart,
      notes: notes || "Booked through conversational assistant",
    });

    const confirmMsg: Message = {
      id: Date.now(),
      role: 'assistant',
      content: `🎉 **Appointment Confirmed!**\n\nYour appointment with **${bookingModalState.doctor.name}** has been confirmed for **${new Date(res.slot_start).toLocaleString()}**.\n\nAppointment Reference: **#${res.id}**. You can view this anytime in your Patient Dashboard.`,
      tool_call_data: {
        type: 'booking_confirmation',
        appointment: res,
      },
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  return (
    <div
      className={`flex flex-col bg-white ${
        isDrawer ? 'h-[550px]' : 'h-[calc(100vh-175px)] min-h-[580px] max-h-[760px]'
      } rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden`}
    >
      {/* Fixed Chat Header */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300 border border-white/20 shadow-inner">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">Hospital Assistant</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Online
              </span>
            </div>
            <p className="text-[11px] text-brand-100">AI Scheduling, Directory & Administrative FAQ</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setMessages([
              {
                id: 'reset',
                role: 'assistant',
                content: "Conversation refreshed. How can I help you today?",
              },
            ]);
            setConversationId(undefined);
          }}
          title="Start fresh conversation"
          className="p-2 text-brand-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area with container-bound scrolling */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4 bg-slate-50/70"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${
                  isUser
                    ? 'bg-slate-700'
                    : 'bg-gradient-to-tr from-brand-600 to-teal-500'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Cards */}
              <div className={`max-w-[88%] sm:max-w-[80%] space-y-3`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-sm shadow-brand-500/20'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Structured UI Tool Attachments */}
                {msg.tool_call_data && (
                  <div className="space-y-3 pt-1">
                    {/* Emergency Alert */}
                    {msg.tool_call_data.type === 'emergency_alert' && (
                      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-900 space-y-2.5 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                          <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                          <span>Emergency Protocol Triggered</span>
                        </div>
                        <p className="text-xs text-red-800">
                          Hospital Assistant has stopped normal automated booking because acute symptoms were detected.
                        </p>
                        <a
                          href="tel:911"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>Call 911 Immediately</span>
                        </a>
                      </div>
                    )}

                    {/* Doctors List: Horizontal carousel with generous width to prevent text squishing */}
                    {msg.tool_call_data.type === 'doctors_list' && msg.tool_call_data.doctors && (
                      <div className="w-full">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Matching Doctors ({msg.tool_call_data.doctors.length})
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin no-scrollbar w-full">
                          {msg.tool_call_data.doctors.map((doc: any) => (
                            <div key={doc.id} className="min-w-[270px] max-w-[290px] flex-shrink-0">
                              <DoctorCard
                                doctor={doc}
                                onSelectSlot={handleSelectDoctorForSlots}
                                onBookNow={(d) => handleSendMessage(`I want to book an appointment with Dr. ${d.name}`)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Slots Picker */}
                    {msg.tool_call_data.type === 'slots_list' && msg.tool_call_data.slots && (
                      <SlotPicker
                        doctorName={msg.tool_call_data.doctor?.name}
                        specialization={msg.tool_call_data.doctor?.specialization}
                        dateStr={msg.tool_call_data.date}
                        slots={msg.tool_call_data.slots}
                        onSelectSlot={(slot) => handleSelectSlot(msg.tool_call_data.doctor, slot)}
                      />
                    )}

                    {/* My Appointments list */}
                    {msg.tool_call_data.type === 'my_appointments' && msg.tool_call_data.data && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">Registered Appointments</span>
                          <span className="text-[11px] text-brand-600 font-semibold">{msg.tool_call_data.data.length} Total</span>
                        </div>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {msg.tool_call_data.data.map((app: any) => (
                            <div key={app.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-slate-900">{app.doctor_name}</p>
                                <p className="text-[11px] text-slate-500">{app.slot_start}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                app.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 pl-2">Consulting hospital database...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Bar */}
      <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-1" />
        {suggestedPrompts.map((prompt, idx) => (
          <button
            type="button"
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              handleSendMessage(prompt);
            }}
            className="px-3 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 border border-slate-200/90 rounded-full whitespace-nowrap transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Fixed Bottom Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about doctors, schedule an appointment, or type symptoms..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white text-xs sm:text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white rounded-2xl shadow-md shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Hospital Assistant is an administrative AI. For medical emergencies, always dial 911 or visit the emergency room.
        </p>
      </div>

      {/* Slot Booking Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={bookingModalState.isOpen}
        doctor={bookingModalState.doctor}
        slotStart={bookingModalState.slotStart}
        onClose={() => setBookingModalState({ isOpen: false, doctor: null, slotStart: '' })}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};
