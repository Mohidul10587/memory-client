'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { schoolsApi, authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Eye, EyeOff, AlertCircle, CheckCircle2,
  School, ChevronDown, ChevronUp, Camera, X,
} from 'lucide-react';
import Image from 'next/image';

type Role = 'STUDENT' | 'TEACHER';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    sscPassingYear: '',
    joiningYear: '',
    subject: '',
    designation: '',
  });

  const { data: schoolsData } = useQuery({
    queryKey: ['schools-dropdown'],
    queryFn: () => schoolsApi.getDropdown(),
  });

  const schools = schoolsData?.data || [];
  const selectedSchool = schools.find((s: { id: string }) => s.id === selectedSchoolId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSchoolId) { setError('স্কুল নির্বাচন করুন'); return; }
    if (!/^01[3-9]\d{8}$/.test(formData.phone)) { setError('সঠিক বাংলাদেশি ফোন নম্বর দিন'); return; }
    if (formData.password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return; }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('schoolId', selectedSchoolId);
      fd.append('name', formData.name);
      fd.append('phone', formData.phone);
      fd.append('password', formData.password);
      if (profileImageFile) fd.append('profileImage', profileImageFile);

      if (selectedRole === 'STUDENT') {
        fd.append('sscPassingYear', formData.sscPassingYear);
        await authApi.registerStudent(fd);
      } else {
        fd.append('joiningYear', formData.joiningYear);
        fd.append('subject', formData.subject);
        fd.append('designation', formData.designation);
        await authApi.registerTeacher(fd);
      }

      await login(formData.phone, formData.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'নিবন্ধন ব্যর্থ হয়েছে';
      setError(msg.includes('already') ? 'এই ফোন নম্বরটি ইতিমধ্যে নিবন্ধিত' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <Image
              src="/logo.svg"
              alt="লোগো"
              width={64}
              height={64}
              className="rounded-2xl shadow-xl shadow-blue-200"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">অ্যালামনাই নিবন্ধন</h1>
          <p className="text-sm text-gray-500 mt-1">আপনার তথ্য দিয়ে একাউন্ট তৈরি করুন</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border-b border-red-100 px-5 py-3.5 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* ── School ── */}
            <div>
              <Label>স্কুল <Required /></Label>

              {selectedSchool ? (
                <button
                  type="button"
                  onClick={() => setSchoolOpen(!schoolOpen)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-50 text-left"
                >
                  <SchoolAvatar school={selectedSchool} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900 truncate">{selectedSchool.name}</p>
                    <p className="text-xs text-blue-500">{selectedSchool.district}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                  {schoolOpen ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-blue-400" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSchoolOpen(!schoolOpen)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
                >
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <School className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 flex-1">স্কুল বেছে নিন</p>
                  {schoolOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
              )}

              {schoolOpen && (
                <div className="mt-1.5 rounded-xl border border-gray-200 overflow-hidden shadow-lg shadow-gray-100">
                  <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                    {schools.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">স্কুল লোড হচ্ছে...</p>
                    ) : (
                      schools.map((school: { id: string; name: string; district: string; logo?: string }) => (
                        <button
                          key={school.id}
                          type="button"
                          onClick={() => { setSelectedSchoolId(school.id); setSchoolOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                            selectedSchoolId === school.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <SchoolAvatar school={school} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                            <p className="text-xs text-gray-400">{school.district}</p>
                          </div>
                          {selectedSchoolId === school.id && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Role ── */}
            <div>
              <Label>আপনি কে? <Required /></Label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="field"
              >
                <option value="STUDENT">🎓 শিক্ষার্থী</option>
                <option value="TEACHER">📚 শিক্ষক</option>
              </select>
            </div>

            {/* ── Profile photo ── */}
            <div>
              <Label>প্রোফাইল ছবি <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span></Label>
              <div className="flex justify-center">
                <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                  {profileImagePreview ? (
                    <>
                      <Image src={profileImagePreview} alt="প্রোফাইল" fill className="object-cover object-top" />
                      <button
                        type="button"
                        onClick={() => { setProfileImageFile(null); setProfileImagePreview(''); }}
                        className="absolute top-1 right-1 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer gap-1.5">
                      <Camera className="h-6 w-6 text-gray-300" />
                      <span className="text-xs text-gray-300 text-center px-2">ছবি আপলোড</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* ── Name ── */}
            <div>
              <Label>নাম <Required /></Label>
              <input name="name" value={formData.name} onChange={handleFieldChange} required placeholder="আপনার পুরো নাম" className="field" />
            </div>

            {/* ── Phone ── */}
            <div>
              <Label>ফোন নম্বর <Required /></Label>
              <input name="phone" value={formData.phone} onChange={handleFieldChange} required placeholder="01XXXXXXXXX" inputMode="numeric" className="field" />
            </div>

            {/* ── Password ── */}
            <div>
              <Label>পাসওয়ার্ড <Required /></Label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleFieldChange}
                  required
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ── Student fields ── */}
            {selectedRole === 'STUDENT' && (
              <div>
                <Label>এসএসসি পাশের সাল <Required /></Label>
                <select name="sscPassingYear" value={formData.sscPassingYear} onChange={handleFieldChange} required className="field">
                  <option value="">সাল বেছে নিন</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            {/* ── Teacher fields ── */}
            {selectedRole === 'TEACHER' && (
              <>
                <div>
                  <Label>যোগদানের সাল <Required /></Label>
                  <select name="joiningYear" value={formData.joiningYear} onChange={handleFieldChange} required className="field">
                    <option value="">সাল বেছে নিন</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <Label>বিষয় <Required /></Label>
                  <input name="subject" value={formData.subject} onChange={handleFieldChange} required placeholder="যেমন: গণিত, বাংলা" className="field" />
                </div>
                <div>
                  <Label>পদবী <Required /></Label>
                  <input name="designation" value={formData.designation} onChange={handleFieldChange} required placeholder="যেমন: সহকারী শিক্ষক" className="field" />
                </div>
              </>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  নিবন্ধন হচ্ছে...
                </>
              ) : 'নিবন্ধন করুন →'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center text-sm text-gray-400">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background-color: #fafafa;
          transition: all 0.15s;
          color: #111827;
        }
        .field::placeholder { color: #d1d5db; }
        .field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
          background-color: #fff;
        }
        select.field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
          padding-right: 2.5rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function Required() {
  return <span className="text-red-400">*</span>;
}

function SchoolAvatar({ school }: { school: { name: string; logo?: string } }) {
  return (
    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
      {school.logo ? (
        <Image src={school.logo} alt={school.name} width={36} height={36} className="object-cover" />
      ) : (
        <span className="text-blue-700 text-xs font-bold">{school.name.slice(0, 2)}</span>
      )}
    </div>
  );
}
