import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Stethoscope, Star, Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { hospitalApi } from '../../services/api';
import { Doctor, Department } from '../../types';

export const DoctorsDirectoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialSearch = searchParams.get('search') || '';
  const initialDept = searchParams.get('department_id') ? Number(searchParams.get('department_id')) : null;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(initialDept);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const deps = await hospitalApi.getDepartments();
        setDepartments(deps);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const docs = await hospitalApi.getDoctors({
          search: searchQuery || undefined,
          department_id: selectedDeptId || undefined,
        });
        setDoctors(docs);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();

    // Sync query params
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedDeptId) params.department_id = selectedDeptId.toString();
    setSearchParams(params);
  }, [searchQuery, selectedDeptId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Medical Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Specialist Doctors
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Search our certified medical staff by department or specialty, check real-time availability, and reserve consultations.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, qualification..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-500 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          {(searchQuery || selectedDeptId) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDeptId(null);
              }}
              className="px-4 py-3 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-slate-200 transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedDeptId(null)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
              selectedDeptId === null
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
            }`}
          >
            All Departments
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
                selectedDeptId === dept.id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/30'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No doctors found</h3>
          <p className="text-xs text-slate-500">
            No active physicians matched your filter criteria. Try searching with a broader keyword or select another department.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId(null);
            }}
            className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded-xl"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={doctor.profile_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                      {doctor.department?.name || 'General'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 truncate mt-1 group-hover:text-brand-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-xs text-brand-600 font-semibold truncate">{doctor.specialization}</p>
                    <p className="text-[11px] text-slate-400 truncate">{doctor.qualification}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {doctor.bio || 'Compassionate physician providing tailored clinical assessments.'}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400">Experience</p>
                    <p className="text-xs font-bold text-slate-800">{doctor.experience} Yrs</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400">Rating</p>
                    <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400">Consultation</p>
                    <p className="text-xs font-bold text-emerald-600">${doctor.consultation_fee}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                  className="w-full py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Check Schedule & Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
