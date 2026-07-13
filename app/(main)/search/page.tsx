'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { studentsApi, teachersApi } from '@/lib/api';
import { StudentCard, TeacherCard } from '@/components/profile/ProfileCards';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { BLOOD_GROUP_LABELS, BloodGroup, StudentProfile, TeacherProfile } from '@/lib/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Student filters
  const [sscYear, setSscYear] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [profession, setProfession] = useState('');

  // Teacher filters
  const [joiningYear, setJoiningYear] = useState('');
  const [subject, setSubject] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sscYear, bloodGroup, profession, joiningYear, subject, activeTab]);

  const studentParams: Record<string, string> = { page: String(page), limit: '24' };
  if (debouncedSearch) studentParams.search = debouncedSearch;
  if (sscYear) studentParams.sscPassingYear = sscYear;
  if (bloodGroup) studentParams.bloodGroup = bloodGroup;
  if (profession) studentParams.profession = profession;

  const teacherParams: Record<string, string> = { page: String(page), limit: '24' };
  if (debouncedSearch) teacherParams.search = debouncedSearch;
  if (joiningYear) teacherParams.joiningYear = joiningYear;
  if (subject) teacherParams.subject = subject;

  const studentSWRKey = isAuthenticated && activeTab === 'student'
    ? ['search-students', JSON.stringify(studentParams)]
    : null;

  const teacherSWRKey = isAuthenticated && activeTab === 'teacher'
    ? ['search-teachers', JSON.stringify(teacherParams)]
    : null;

  const { data: studentData, isLoading: studentLoading } = useSWR(
    studentSWRKey,
    () => studentsApi.getAll(studentParams),
    { revalidateOnFocus: false },
  );

  const { data: teacherData, isLoading: teacherLoading } = useSWR(
    teacherSWRKey,
    () => teachersApi.getAll(teacherParams),
    { revalidateOnFocus: false },
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 }, (_, i) => currentYear - i);
  const isLoading = studentLoading || teacherLoading;

  const students = (studentData?.data as (StudentProfile & { user: { id: string; phone: string } })[]) || [];
  const teachers = (teacherData?.data as (TeacherProfile & { user: { id: string; phone: string } })[]) || [];
  const meta = activeTab === 'student' ? studentData?.meta : teacherData?.meta;

  const clearFilters = () => {
    setSscYear(''); setBloodGroup(''); setProfession('');
    setJoiningYear(''); setSubject('');
  };
  const hasFilters = sscYear || bloodGroup || profession || joiningYear || subject;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">অনুসন্ধান</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'student' ? 'নাম, ফোন, পেশা বা সাল দিয়ে খুঁজুন...' : 'নাম, ফোন বা বিষয় দিয়ে খুঁজুন...'}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Tabs + Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('student')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'student' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              শিক্ষার্থী {studentData?.meta && `(${studentData.meta.total})`}
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'teacher' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              শিক্ষক {teacherData?.meta && `(${teacherData.meta.total})`}
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              hasFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            ফিল্টার
            {hasFilters && <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">!</span>}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">ফিল্টার</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">
                  সব মুছুন
                </button>
              )}
            </div>
            {activeTab === 'student' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">এসএসসি সাল</label>
                  <select value={sscYear} onChange={(e) => setSscYear(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">সব সাল</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">রক্তের গ্রুপ</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">সব গ্রুপ</option>
                    {Object.entries(BLOOD_GROUP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">পেশা</label>
                  <input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="পেশা লিখুন" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">যোগদানের সাল</label>
                  <select value={joiningYear} onChange={(e) => setJoiningYear(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">সব সাল</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">বিষয়</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয় লিখুন" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner />
        ) : activeTab === 'student' ? (
          students.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {students.map((s) => (
                  <StudentCard
                    key={s.id}
                    userId={s.user.id}
                    name={s.name}
                    profileImage={s.profileImage}
                    sscPassingYear={s.sscPassingYear}
                    profession={s.profession}
                    bloodGroup={s.bloodGroup}
                    phone={s.user.phone}
                  />
                ))}
              </div>
              {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
            </>
          )
        ) : teachers.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">কোনো শিক্ষক পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {teachers.map((t) => (
                <TeacherCard
                  key={t.id}
                  userId={t.user.id}
                  name={t.name}
                  profileImage={t.profileImage}
                  designation={t.designation}
                  subject={t.subject}
                  joiningYear={t.joiningYear}
                  bloodGroup={t.bloodGroup}
                />
              ))}
            </div>
            {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
          </>
        )}
    </div>
  );
}
