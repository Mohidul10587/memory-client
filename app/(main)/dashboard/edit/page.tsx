'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWRMutation from 'swr/mutation';
import { studentsApi, teachersApi } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { BLOOD_GROUP_LABELS, BloodGroup } from '@/lib/types';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const isStudent = user?.role === 'STUDENT';
  const profile = isStudent ? user?.studentProfile : user?.teacherProfile;

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    sscPassingYear: String((user?.studentProfile as { sscPassingYear?: number })?.sscPassingYear || ''),
    joiningYear: String((user?.teacherProfile as { joiningYear?: number })?.joiningYear || ''),
    subject: (user?.teacherProfile as { subject?: string })?.subject || '',
    designation: (user?.teacherProfile as { designation?: string })?.designation || '',
    currentAddress: profile?.currentAddress || '',
    permanentAddress: profile?.permanentAddress || '',
    profession: (user?.studentProfile as { profession?: string })?.profession || '',
    workplace: (user?.studentProfile as { workplace?: string })?.workplace || '',
    email: profile?.email || '',
    facebookProfile: profile?.facebookProfile || '',
    bloodGroup: (profile?.bloodGroup as BloodGroup | '') || '',
    about: profile?.about || '',
  });

  useEffect(() => {
    if (user) {
      const p = isStudent ? user.studentProfile : user.teacherProfile;
      setFormData({
        name: p?.name || '',
        sscPassingYear: String(user.studentProfile?.sscPassingYear || ''),
        joiningYear: String(user.teacherProfile?.joiningYear || ''),
        subject: user.teacherProfile?.subject || '',
        designation: user.teacherProfile?.designation || '',
        currentAddress: p?.currentAddress || '',
        permanentAddress: p?.permanentAddress || '',
        profession: user.studentProfile?.profession || '',
        workplace: user.studentProfile?.workplace || '',
        email: p?.email || '',
        facebookProfile: p?.facebookProfile || '',
        bloodGroup: (p?.bloodGroup as BloodGroup | '') || '',
        about: p?.about || '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const { trigger, isMutating } = useSWRMutation(
    'update-profile',
    async (_key: string, { arg }: { arg: Record<string, unknown> }) => {
      if (isStudent) return studentsApi.updateProfile(user!.id, arg);
      return teachersApi.updateProfile(user!.id, arg);
    },
    {
      onSuccess: async () => {
        await refreshUser();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err: Error) => {
        setError(err.message || 'আপডেট ব্যর্থ হয়েছে');
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: Record<string, unknown> = { ...formData };
    if (isStudent) {
      payload.sscPassingYear = parseInt(formData.sscPassingYear);
      delete payload.joiningYear;
      delete payload.subject;
      delete payload.designation;
    } else {
      payload.joiningYear = parseInt(formData.joiningYear);
      delete payload.sscPassingYear;
      delete payload.profession;
      delete payload.workplace;
    }
    // Remove empty optional fields
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null || payload[k] === undefined) {
        delete payload[k];
      }
    });
    trigger(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 }, (_, i) => currentYear - i);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">প্রোফাইল সম্পাদনা</h1>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm">প্রোফাইল সফলভাবে আপডেট হয়েছে!</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <Field label="নাম" name="name" value={formData.name} onChange={handleChange} required />

          {isStudent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">এসএসসি পাশের সাল</label>
                <select name="sscPassingYear" value={formData.sscPassingYear} onChange={handleChange} className="input-field">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Field label="পেশা" name="profession" value={formData.profession} onChange={handleChange} />
              <Field label="কর্মস্থল" name="workplace" value={formData.workplace} onChange={handleChange} />
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">যোগদানের সাল</label>
                <select name="joiningYear" value={formData.joiningYear} onChange={handleChange} className="input-field">
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Field label="বিষয়" name="subject" value={formData.subject} onChange={handleChange} />
              <Field label="পদবী" name="designation" value={formData.designation} onChange={handleChange} />
            </>
          )}

          <Field label="বর্তমান ঠিকানা" name="currentAddress" value={formData.currentAddress} onChange={handleChange} />
          <Field label="স্থায়ী ঠিকানা" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} />
          <Field label="ইমেইল" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Field label="ফেসবুক প্রোফাইল" name="facebookProfile" value={formData.facebookProfile} onChange={handleChange} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">রক্তের গ্রুপ</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field">
              <option value="">নির্বাচন করুন</option>
              {Object.entries(BLOOD_GROUP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নিজের সম্পর্কে</label>
            <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="নিজের সম্পর্কে লিখুন..." />
          </div>

          <button
            type="submit"
            disabled={isMutating}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isMutating ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
          </button>
        </form>
      </main>

      <style jsx global>{`
        .input-field { width:100%; padding:0.625rem 0.875rem; border:1px solid #e5e7eb; border-radius:0.5rem; font-size:0.875rem; outline:none; transition:all 0.15s; }
        .input-field:focus { border-color:transparent; box-shadow:0 0 0 2px #3b82f6; }
        select.input-field { appearance:none; background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position:right 0.75rem center; background-repeat:no-repeat; background-size:1.25em 1.25em; padding-right:2.5rem; }
      `}</style>
    </div>
  );
}

function Field({
  label, name, value, onChange, type = 'text', required = false,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input name={name} type={type} value={value} onChange={onChange} required={required} className="input-field" />
    </div>
  );
}
