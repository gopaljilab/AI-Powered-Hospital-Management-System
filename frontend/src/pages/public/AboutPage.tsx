import React from 'react';
import { ShieldCheck, Award, HeartHandshake, Stethoscope, Users, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20 pt-8">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          About HospitalX Medical Center
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto">
          Pioneering Advanced Medicine & Patient-Centered Innovation
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Founded as a modern technological medical prototype, HospitalX merges compassionate clinical care 
          with state-of-the-art conversational artificial intelligence.
        </p>
      </section>

      {/* Mission & Vision Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Clinical Mission</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To deliver compassionate, evidence-based healthcare with zero friction. We eliminate lengthy phone waits 
              and appointment uncertainty by placing verified doctors and real-time scheduling at patients' fingertips.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Patient privacy and clinical integrity as primary benchmarks.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Interdisciplinary clinical coordination across 6 core departments.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our AI Architectural Vision</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We operate on an unwavering philosophy: <em>"The AI understands the request; the backend and database decide what is true."</em> 
              Our conversational intelligence is designed with bulletproof safety boundaries.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Strict administrative scope—never generates phantom clinical advice.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Immediate emergency triage referral for acute distress symptoms.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Facilities Highlight */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900">Modern Healthcare Infrastructure</h2>
            <p className="text-sm text-slate-500">
              Designed for optimal clinical outcomes, patient comfort, and seamless operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <Building2 className="w-8 h-8 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Level 1 Emergency Center</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Operating 24 hours a day with rapid-response triage bays, cardiac resuscitation equipment, and trauma suites.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <Stethoscope className="w-8 h-8 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Advanced Diagnostic Labs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated clinical pathology, high-resolution MRI, CT scanning, and same-day electronic diagnostic reporting.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Unified Role Governance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Robust role-based access control separating patient charts, doctor schedules, front desk reception, and audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900">Experience Intelligent Healthcare</h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Start a consultation inquiry with our conversational assistant or view our certified physicians.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/assistant"
            className="px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all"
          >
            Launch AI Assistant
          </Link>
          <Link
            to="/doctors"
            className="px-6 py-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all"
          >
            View Doctor Directory
          </Link>
        </div>
      </section>
    </div>
  );
};
