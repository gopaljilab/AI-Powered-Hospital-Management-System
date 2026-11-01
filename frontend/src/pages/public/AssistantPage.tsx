import React, { useState } from 'react';
import { Bot, Sparkles, ShieldAlert, Heart, Calendar, HelpCircle, PhoneCall, ShieldCheck } from 'lucide-react';
import { ChatInterface } from '../../components/chat/ChatInterface';

export const AssistantPage: React.FC = () => {
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined);

  const quickTopics = [
    { title: "Find Cardiologist", prompt: "Can you recommend a cardiologist and check their schedule?" },
    { title: "Book Tomorrow", prompt: "I want to book an appointment with a dermatologist tomorrow." },
    { title: "Check My Bookings", prompt: "Show my existing hospital appointments." },
    { title: "Visiting Hours", prompt: "What are the hospital visiting hours and parking rules?" },
    { title: "Accepted Insurance", prompt: "What insurance providers does the hospital accept?" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Streamlined Top Bar (No duplicate "Hospital Assistant" title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">HospitalX Medical Center</span>
          <span>•</span>
          <span className="font-semibold text-brand-600">Smart Conversational Intake Desk</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            OpenAI Tool-Calling Active
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Sticky Sidebar with Suggested Queries & Safety Guardrails */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 self-start order-2 lg:order-1">
          {/* Quick Prompts Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Suggested Queries</span>
            </h3>
            <div className="space-y-2">
              {quickTopics.map((topic, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setInitialPrompt(topic.prompt);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-brand-700 transition-all flex items-center justify-between group"
                >
                  <span>{topic.title}</span>
                  <span className="text-slate-400 group-hover:text-brand-600">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Guidelines Card */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-6 space-y-3 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Safety & AI Guardrails</span>
            </div>
            <p className="leading-relaxed text-amber-800/90">
              This assistant is strictly an <strong>administrative scheduler</strong>. It will never provide clinical diagnoses, recommend medications, or replace certified medical personnel.
            </p>
            <div className="p-3 bg-red-100/90 rounded-2xl border border-red-200 text-red-900 font-medium">
              🚨 <strong>Emergency Directive:</strong> In case of acute chest pain, shortness of breath, or trauma, call <strong>911</strong> immediately.
            </div>
          </div>

          {/* Architectural Principle */}
          <div className="p-5 bg-slate-900 text-slate-300 rounded-3xl space-y-2 text-xs shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Core Principle</p>
            <p className="italic text-slate-100 font-medium">
              "The AI understands the request; the backend and database decide what is true."
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Every slot and appointment reservation is validated by FastAPI against PostgreSQL transaction state.
            </p>
          </div>
        </aside>

        {/* Right Side: Main Chat Interface */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <ChatInterface initialPrompt={initialPrompt} />
        </div>
      </div>
    </div>
  );
};
