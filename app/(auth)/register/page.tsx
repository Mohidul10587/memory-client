'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { schoolsApi, authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import Image from 'next/image';

type Role = 'STUDENT' | 'TEACHER';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSchoolId) { setError('স্কুল নির্বাচন করুন'); return; }
    if (!selectedRole) { setError('শিক্ষার্থী বা শিক্ষক নির্বাচন করুন'); return; }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-3">
            <span className="text-white text-xl font-bold">অ্যা</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">নিবন্ধন করুন</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 mb-5 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* School Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                স্কুল নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 rounded-lg border border-gray-200 p-2">
                {schools.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-3">স্কুল লোড হচ্ছে...</p>
                ) : (
                  schools.map((school: { id: string; name: string; district: string; logo?: string }) => (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => setSelectedSchoolId(school.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        selectedSchoolId === school.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {school.logo ? (
                          <Image src={school.logo} alt={school.name} width={36} height={36} className="object-cover" />
                        ) : (
                          <span className="text-blue-700 text-xs font-bold">{school.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                        <p className="text-xs text-gray-500">{school.district}</p>
                      </div>
                      {selectedSchoolId === school.id && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                আপনি কে? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['STUDENT', 'TEACHER'] as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                      selectedRole === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{role === 'STUDENT' ? '🎓' : '📚'}</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {role === 'STUDENT' ? 'শিক্ষার্থী' : 'শিক্ষক'}
                    </span>
                    {selectedRole === role && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Profile Image */}
            <div className="flex items-start gap-4">
              <div className="relative w-24 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 shrink-0">
                {profileImagePreview ? (
                  <>
                    <Image src={profileImagePreview} alt="প্রোফাইল ছবি" fill className="object-cover object-top" />
                    <button
                      type="button"
                      onClick={() => { setProfileImageFile(null); setProfileImagePreview(''); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer gap-1.5">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-400 text-center px-1">ছবি</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নাম <span className="text-red-500">*</span></label>
                  <input name="name" value={formData.name} onChange={handleFieldChange} required placeholder="আপনার পুরো নাম" className="input-field" />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর <span className="text-red-500">*</span></label>
                  <input name="phone" value={formData.phone} onChange={handleFieldChange} required placeholder="01XXXXXXXXX" className="input-field" />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleFieldChange}
                      required
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Student-specific */}
            {selectedRole === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">এসএসসি পাশের সাল <span className="text-red-500">*</span></label>
                <select name="sscPassingYear" value={formData.sscPassingYear} onChange={handleFieldChange} required className="input-field">
                  <option value="">সাল নির্বাচন করুন</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            {/* Teacher-specific */}
            {selectedRole === 'TEACHER' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">যোগদানের সাল <span className="text-red-500">*</span></label>
                  <select name="joiningYear" value={formData.joiningYear} onChange={handleFieldChange} required className="input-field">
                    <option value="">সাল নির্বাচন করুন</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিষয় <span className="text-red-500">*</span></label>
                  <input name="subject" value={formData.subject} onChange={handleFieldChange} required placeholder="যেমন: গণিত, বাংলা" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পদবী <span className="text-red-500">*</span></label>
                  <input name="designation" value={formData.designation} onChange={handleFieldChange} required placeholder="যেমন: সহকারী শিক্ষক" className="input-field" />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
            >
              {isLoading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.15s;
        }
        .input-field:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #3b82f6;
        }
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
}
