import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, Heart, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Hospital<span className="text-teal-400">X</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An intelligent, full-stack hospital management platform integrating conversational AI, 
              real-time doctor scheduling, and unified patient-staff coordination.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Academic Prototype Disclaimer:</strong> Built with fictional hospital and doctor records. 
                For acute or life-threatening medical emergencies, please immediately contact 911 or visit your local emergency department.
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home Portal</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Our Center</Link></li>
              <li><Link to="/departments" className="hover:text-white transition-colors">Departments</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition-colors">Doctors Directory</Link></li>
              <li><Link to="/assistant" className="hover:text-teal-300 font-semibold text-teal-400 flex items-center gap-1.5">Hospital Assistant AI</Link></li>
            </ul>
          </div>

          {/* Clinical Specialties */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Specialties</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Cardiovascular Medicine</li>
              <li>Clinical Dermatology</li>
              <li>Pediatric Care</li>
              <li>Orthopedic Surgery</li>
              <li>Neurology & Spine</li>
              <li>General Internal Medicine</li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Hours</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>100 Hospital Way, Medical Plaza, Suite 400</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>OPD Bookings: (555) 019-CARE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@hospitalx.org</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Outpatient Clinics: Mon-Fri 8:30 AM - 5:30 PM<br/>Emergency ER: Open 24/7/365</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 HospitalX Medical Systems. All fictional rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>HIPAA-Inspired Security Prototype</span>
            <span>FastAPI + PostgreSQL + React + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
