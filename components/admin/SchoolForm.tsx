'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School } from '@/lib/types';
import { schoolsApi } from '@/lib/api';
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const DIVISIONS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];

interface SchoolFormProps {
  mode: 'create' | 'edit';
  school?: School;
}

export default function SchoolForm({ mode, school }: SchoolFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [logoPreview, setLogoPreview] = useState<string | null>(school?.logo || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(school?.coverPhoto || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: school?.name || '',
    eiin: school?.eiin || '',
    establishedYear: school?.establishedYear ? String(school.establishedYear) : '',
    address: school?.address || '',
    upazila: school?.upazila || '',
    district: school?.district || '',
    division: school?.division || '',
    phone: school?.phone || '',
    email: school?.email || '',
    website: school?.website || '',
    facebookPage: school?.facebookPage || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'logo') { setLogoFile(file); setLogoPreview(url); }
    else { setCoverFile(file); setCoverPreview(url); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) fd.append(key, val);
      });
      if (logoFile) fd.append('logo', logoFile);
      if (coverFile) fd.append('coverPhoto', coverFile);

      if (mode === 'create') {
        await schoolsApi.create(fd);
        setSuccess('স্কুল সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => router.push('/admin/schools'), 1200);
      } else {
        await schoolsApi.update(school!.id, fd);
        setSuccess('স্কুল সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => router.push('/admin/schools'), 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে।';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin/schools" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-gray-900">
            {mode === 'create' ? 'নতুন স্কুল তৈরি করুন' : 'স্কুল সম্পাদনা করুন'}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Alert */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">ছবি</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Logo */}
              <div>
                <p className="text-sm text-gray-600 mb-2">স্কুলের লোগো</p>
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e, 'logo')} />
                  {logoPreview ? (
                    <div className="relative">
                      <img src={logoPreview} alt="logo" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setLogoPreview(null); setLogoFile(null); }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border"
                      >
                        <X className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-300 transition-colors">
                      <Upload className="h-6 w-6 text-gray-300" />
                      <span className="text-xs text-gray-400">লোগো আপলোড</span>
                    </div>
                  )}
                </label>
              </div>
              {/* Cover */}
              <div>
                <p className="text-sm text-gray-600 mb-2">কভার ফটো</p>
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e, 'cover')} />
                  {coverPreview ? (
                    <div className="relative">
                      <img src={coverPreview} alt="cover" className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setCoverPreview(null); setCoverFile(null); }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border"
                      >
                        <X className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-300 transition-colors">
                      <Upload className="h-6 w-6 text-gray-300" />
                      <span className="text-xs text-gray-400">কভার আপলোড</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">মূল তথ্য</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  স্কুলের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="যেমন: ঢাকা রেসিডেনসিয়াল মডেল কলেজ"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">EIIN নম্বর</label>
                <input
                  type="text"
                  name="eiin"
                  value={form.eiin}
                  onChange={handleChange}
                  placeholder="যেমন: 108022"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  স্থাপনার সাল <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="establishedYear"
                  value={form.establishedYear}
                  onChange={handleChange}
                  required
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="যেমন: 1954"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">অবস্থান</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ঠিকানা <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="গ্রাম/মহল্লা, রাস্তা"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  উপজেলা <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="upazila"
                  value={form.upazila}
                  onChange={handleChange}
                  required
                  placeholder="যেমন: মিরপুর"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  জেলা <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  placeholder="যেমন: ঢাকা"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  বিভাগ <span className="text-red-500">*</span>
                </label>
                <select
                  name="division"
                  value={form.division}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">যোগাযোগ (ঐচ্ছিক)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="school@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ওয়েবসাইট</label>
                <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://school.edu.bd"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ফেসবুক পেজ</label>
                <input type="url" name="facebookPage" value={form.facebookPage} onChange={handleChange} placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <Link
              href="/admin/schools"
              className="flex-1 text-center py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              বাতিল
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                mode === 'create' ? 'স্কুল তৈরি করুন' : 'পরিবর্তন সংরক্ষণ করুন'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
