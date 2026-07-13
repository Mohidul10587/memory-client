'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminUsersApi } from '@/lib/api';
import { User, BLOOD_GROUP_LABELS, BloodGroup } from '@/lib/types';
import {
  ChevronLeft, Save, GraduationCap, BookOpen,
  Phone, MapPin, User as UserIcon, ToggleRight, ToggleLeft,
} from 'lucide-react';

const DIVISIONS = ['বরিশাল', 'চট্টগ্রাম', 'ঢাকা', 'খুলনা', 'ময়মনসিংহ', 'রাজশাহী', 'রংপুর', 'সিলেট'];

export default function AdminUserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminUsersApi.getOne(userId),
  });

  const user = data?.data as User | undefined;
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [isActive, setIsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsActive(user.isActive);
    if (user.role === 'STUDENT' && user.studentProfile) {
      const p = user.studentProfile;
      setFormData({
        name: p.name ?? '', sscPassingYear: p.sscPassingYear ?? '',
        division: p.division ?? '', district: p.district ?? '',
        upazila: p.upazila ?? '', union: p.union ?? '',
        currentAddress: p.currentAddress ?? '', permanentAddress: p.permanentAddress ?? '',
        profession: p.profession ?? '', workplace: p.workplace ?? '',
        email: p.email ?? '', facebookProfile: p.facebookProfile ?? '',
        bloodGroup: p.bloodGroup ?? '', about: p.about ?? '',
      });
    } else if (user.role === 'TEACHER' && user.teacherProfile) {
      const p = user.teacherProfile;
      setFormData({
        name: p.name ?? '', joiningYear: p.joiningYear ?? '',
        subject: p.subject ?? '', designation: p.designation ?? '',
        division: p.division ?? '', district: p.district ?? '',
        upazila: p.upazila ?? '', union: p.union ?? '',
        currentAddress: p.currentAddress ?? '', permanentAddress: p.permanentAddress ?? '',
        email: p.email ?? '', facebookProfile: p.facebookProfile ?? '',
        bloodGroup: p.bloodGroup ?? '', about: p.about ?? '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = { ...formData, isActive };
      if (user?.role === 'STUDENT') {
        return adminUsersApi.updateStudent(userId, { ...payload, sscPassingYear: payload.sscPassingYear ? Number(payload.sscPassingYear) : undefined });
      } else {
        return adminUsersApi.updateTeacher(userId, { ...payload, joiningYear: payload.joiningYear ? Number(payload.joiningYear) : undefined });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (field: string, value: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        ইউজার পাওয়া যায়নি।
      </div>
    );
  }

  const isStudent = user.role === 'STUDENT';

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            {isStudent
              ? <GraduationCap className="h-5 w-5 text-blue-600" />
              : <BookOpen className="h-5 w-5 text-purple-600" />}
            <span className="font-bold text-gray-900">{isStudent ? 'শিক্ষার্থী' : 'শিক্ষক'} সম্পাদনা</span>
          </div>
        </div>
        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`}
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : saved ? 'সংরক্ষিত ✓' : 'সংরক্ষণ করুন'}
        </button>
      </div>

      {updateMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {(updateMutation.error as Error)?.message ?? 'কিছু একটা সমস্যা হয়েছে।'}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          {(user.studentProfile?.profileImage ?? user.teacherProfile?.profileImage) ? (
            <img src={user.studentProfile?.profileImage ?? user.teacherProfile?.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
              {(user.studentProfile?.name ?? user.teacherProfile?.name ?? '?').charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user.studentProfile?.name ?? user.teacherProfile?.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
              <Phone className="h-3.5 w-3.5" />
              <span className="font-mono">{user.phone}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user.school?.name}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">সক্রিয়:</span>
            <button type="button" onClick={() => setIsActive(!isActive)} className={`transition-colors ${isActive ? 'text-green-600' : 'text-red-400'}`}>
              {isActive ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-400" />মৌলিক তথ্য
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="নাম" value={String(formData.name ?? '')} onChange={(v) => set('name', v)} />
          {isStudent ? (
            <Field label="SSC পাসের বছর" type="number" value={String(formData.sscPassingYear ?? '')} onChange={(v) => set('sscPassingYear', v)} />
          ) : (
            <>
              <Field label="যোগদানের বছর" type="number" value={String(formData.joiningYear ?? '')} onChange={(v) => set('joiningYear', v)} />
              <Field label="বিষয়" value={String(formData.subject ?? '')} onChange={(v) => set('subject', v)} />
              <Field label="পদবী" value={String(formData.designation ?? '')} onChange={(v) => set('designation', v)} />
            </>
          )}
          {isStudent && (
            <>
              <Field label="পেশা" value={String(formData.profession ?? '')} onChange={(v) => set('profession', v)} />
              <Field label="কর্মস্থল" value={String(formData.workplace ?? '')} onChange={(v) => set('workplace', v)} />
            </>
          )}
          <Field label="ইমেইল" type="email" value={String(formData.email ?? '')} onChange={(v) => set('email', v)} />
          <Field label="ফেসবুক প্রোফাইল" value={String(formData.facebookProfile ?? '')} onChange={(v) => set('facebookProfile', v)} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">রক্তের গ্রুপ</label>
            <select value={String(formData.bloodGroup ?? '')} onChange={(e) => set('bloodGroup', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">নির্বাচন করুন</option>
              {(Object.keys(BLOOD_GROUP_LABELS) as BloodGroup[]).map((bg) => (
                <option key={bg} value={bg}>{BLOOD_GROUP_LABELS[bg]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">পরিচয় / বিবরণ</label>
          <textarea rows={3} value={String(formData.about ?? '')} onChange={(e) => set('about', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="নিজের সম্পর্কে লিখুন..." />
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />ঠিকানা তথ্য
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">বিভাগ</label>
            <select value={String(formData.division ?? '')} onChange={(e) => set('division', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">নির্বাচন করুন</option>
              {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <Field label="জেলা" placeholder="যেমন: পিরোজপুর" value={String(formData.district ?? '')} onChange={(v) => set('district', v)} />
          <Field label="উপজেলা" placeholder="যেমন: কাউখালী" value={String(formData.upazila ?? '')} onChange={(v) => set('upazila', v)} />
          <Field label="ইউনিয়ন / গ্রাম" placeholder="যেমন: নীলতী" value={String(formData.union ?? '')} onChange={(v) => set('union', v)} />
          <Field label="বর্তমান ঠিকানা" value={String(formData.currentAddress ?? '')} onChange={(v) => set('currentAddress', v)} />
          <Field label="স্থায়ী ঠিকানা" value={String(formData.permanentAddress ?? '')} onChange={(v) => set('permanentAddress', v)} />
        </div>
      </section>

      {/* Bottom Save */}
      <div className="flex justify-end pb-8">
        <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
