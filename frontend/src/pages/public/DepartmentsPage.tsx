import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Stethoscope, Users, HeartPulse, Brain, Baby, Bone, Sparkles } from 'lucide-react';
import { hospitalApi } from '../../services/api';
import { Department } from '../../types';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await hospitalApi.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const getDeptIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cardio')) return <HeartPulse className="w-6 h-6 text-rose-500" />;
    if (lower.includes('derm')) return <Sparkles className="w-6 h-6 text-amber-500" />;
    if (lower.includes('ped')) return <Baby className="w-6 h-6 text-teal-500" />;
    if (lower.includes('ortho')) return <Bone className="w-6 h-6 text-indigo-500" />;
    if (lower.includes('neuro')) return <Brain className="w-6 h-6 text-purple-500" />;
    return <Stethoscope className="w-6 h-6 text-brand-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Medical Specialties
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Clinical Departments & Centers
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Comprehensive medical divisions staffed by board-certified physicians, surgeon specialists, and dedicated nursing staff.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between group"
            >
              {dept.image_url && (
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={dept.image_url}
                    alt={dept.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                    {getDeptIcon(dept.name)}
                  </div>
                </div>
              )}

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.doctor_count} Active Specialists</span>
                  </span>
                  <Link
                    to={`/doctors?department_id=${dept.id}`}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all flex items-center gap-1 shadow-sm shadow-brand-500/20"
                  >
                    <span>View Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
