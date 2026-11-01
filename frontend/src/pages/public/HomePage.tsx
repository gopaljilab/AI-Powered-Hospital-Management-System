import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Bot, 
  Calendar, 
  CheckCircle, 
  Clock, 
  HeartPulse, 
  PhoneCall, 
  ShieldCheck, 
  Star, 
  Stethoscope, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Search 
} from 'lucide-react';
import { hospitalApi } from '../../services/api';
import { Department, Doctor, HospitalFAQ } from '../../types';
import { DoctorCard } from '../../components/chat/DoctorCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [faqs, setFaqs] = useState<HospitalFAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deps, docs, faqList] = await Promise.all([
          hospitalApi.getDepartments(),
          hospitalApi.getDoctors(),
          hospitalApi.getFAQs(),
        ]);
        setDepartments(deps.slice(0, 6));
        setFeaturedDoctors(docs.slice(0, 4));
        setFaqs(faqList.slice(0, 5));
      } catch (err) {
        console.error('Error loading home data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        {/* Soft background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-brand-200/40 via-teal-100/30 to-blue-200/30 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Next-Generation Healthcare Management</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Intelligent Medical Care,{' '}
                <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">
                  Powered by AI
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Book verified specialist appointments in real time, explore expert clinical departments, 
                and converse with our intelligent <strong>Hospital Assistant</strong> for instant scheduling and support.
              </p>

              {/* Doctor Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0 flex items-center p-2 bg-white rounded-2xl shadow-lg shadow-slate-200/80 border border-slate-200/80">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctor by name, specialty, e.g. Cardiologist..."
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all shrink-0"
                >
                  Find Doctors
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/assistant"
                  className="px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 group"
                >
                  <Bot className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform" />
                  <span>Talk with Hospital Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/doctors"
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 hover:text-brand-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all"
                >
                  Browse Doctors Directory
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-500 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Verified Physicians</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Real-Time Slot Engine</span>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Hospital Assistant</h3>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online & Ready to Book
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-md">
                    FastAPI + OpenAI
                  </span>
                </div>

                {/* Mock conversation bubbles */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl rounded-tl-none border border-slate-200/80">
                    "I want to book an appointment with a cardiologist tomorrow morning."
                  </div>
                  <div className="p-3.5 bg-brand-50 text-brand-900 rounded-2xl rounded-tr-none border border-brand-100 space-y-2">
                    <p className="font-medium">
                      "I located **Dr. Sarah Chen, MD** (Cardiology). Here are her verified open slots for tomorrow:"
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-white text-brand-700 font-bold rounded-lg border border-brand-200 text-[11px] shadow-2xs">
                        09:30 AM
                      </span>
                      <span className="px-2.5 py-1 bg-teal-600 text-white font-bold rounded-lg text-[11px] shadow-2xs">
                        10:00 AM (Selected)
                      </span>
                      <span className="px-2.5 py-1 bg-white text-brand-700 font-bold rounded-lg border border-brand-200 text-[11px] shadow-2xs">
                        11:30 AM
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/assistant"
                  className="w-full py-2.5 text-xs font-bold text-center text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all block"
                >
                  Try AI Hospital Assistant Now
                </Link>
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3 hidden sm:flex">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  99%
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Zero Double-Bookings</p>
                  <p className="text-[10px] text-slate-500">Atomic database locking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-600">6+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical Departments</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-600">100%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Board Certified MDs</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-600">24/7</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Emergency Services</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-600">&lt; 30s</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Booking Flow</p>
          </div>
        </div>
      </section>

      {/* CLINICAL DEPARTMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Centers of Excellence</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Medical Departments</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Equipped with modern diagnostic laboratories, specialized clinics, and seasoned healthcare practitioners.
            </p>
          </div>
          <Link
            to="/departments"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {dept.doctor_count || 1} Certified Specialists
                </span>
                <Link
                  to={`/doctors?department_id=${dept.id}`}
                  className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="bg-slate-100/60 py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Expert Clinical Staff</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Featured Doctors</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl">
                Compassionate physicians committed to patient wellness and evidence-based medicine.
              </p>
            </div>
            <Link
              to="/doctors"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
            >
              <span>Explore Doctors Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onBookNow={(d) => navigate(`/doctors/${d.id}`)}
                onSelectSlot={(d) => navigate(`/doctors/${d.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Simple & Transparent</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How HospitalX Works</h2>
          <p className="text-sm text-slate-500">
            Enjoy seamless healthcare scheduling through natural language or our intuitive online directory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Select Doctor or Speak with AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use our conversational assistant in natural language or filter our doctor directory by medical department.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Pick Real-Time Available Slot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Slots are verified live against doctor weekly schedules, hospital leaves, and non-cancelled appointments.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Instant Database Confirmation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Confirmed inside an atomic PostgreSQL transaction. Manage, reschedule, or cancel anytime from your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hospital Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500">
            Answers to common queries regarding visiting hours, insurance, parking, and bookings.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className="text-slate-400 font-normal text-lg ml-4">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
