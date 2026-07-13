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

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
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
      Object.entries(form).forEach(([key, val]) => { if (val) fd.append(key, val); });
      if (logoFile) fd.append('logo', logoFile);
      if (coverFile) fd.append('coverPhoto', coverFile);

      if (mode === 'create') {
        await schoolsApi.create(fd);
        setSuccess('স্কুল সফলভাবে তৈরি হয়েছে!');
      } else {
        await schoolsApi.update(school!.id, fd);
        setSuccess('স্কুল সফলভাবে আপডেট হয়েছে!');
      }
      setTimeout(() => router.push('/admin/schools'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <Link href="/admin/schools" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">
          {mode === 'create' ? 'নতুন স্কুল তৈরি করুন' : 'স্কুল সম্পাদনা করুন'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
          </div>
        )}

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">ছবি</h2>
          <div className="grid grid-cols-2 gap-4">
            {(['logo', 'cover'] as const).map((type) => {
              const preview = type === 'logo' ? logoPreview : coverPreview;
              const clear = () => type === 'logo' ? (setLogoPreview(null), setLogoFile(null)) : (setCoverPreview(null), setCoverFile(null));
              return (
                <div key={type}>
                  <p className="text-sm text-gray-600 mb-2">{type === 'logo' ? 'স্কুলের লোগো' : 'কভার ফটো'}</p>
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e, type)} />
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt={type} className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={(e) => { e.preventDefault(); clear(); }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border">
                          <X className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-300 transition-colors">
                        <Upload className="h-6 w-6 text-gray-300" />
                        <span className="text-xs text-gray-400">{type === 'logo' ? 'লোগো' : 'কভার'} আপলোড</span>
                      </div>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">মূল তথ্য</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>স্কুলের নাম <Req /></Label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="যেমন: ঢাকা রেসিডেনসিয়াল মডেল কলেজ" className="field" />
            </div>
            <div>
              <Label>EIIN নম্বর</Label>
              <input name="eiin" value={form.eiin} onChange={handleChange} placeholder="যেমন: 108022" className="field" />
            </div>
            <div>
              <Label>স্থাপনার সাল <Req /></Label>
              <input name="establishedYear" type="number" value={form.establishedYear} onChange={handleChange} required min="1800" max={new Date().getFullYear()} placeholder="যেমন: 1954" className="field" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">অবস্থান</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>ঠিকানা <Req /></Label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="গ্রাম/মহল্লা, রাস্তা" className="field" />
            </div>
            <div><Label>উপজেলা <Req /></Label><input name="upazila" value={form.upazila} onChange={handleChange} required placeholder="যেমন: মিরপুর" className="field" /></div>
            <div><Label>জেলা <Req /></Label><input name="district" value={form.district} onChange={handleChange} required placeholder="যেমন: ঢাকা" className="field" /></div>
            <div>
              <Label>বিভাগ <Req /></Label>
              <select name="division" value={form.division} onChange={handleChange} required className="field">
                <option value="">বিভাগ নির্বাচন করুন</option>
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">যোগাযোগ <span className="text-gray-400 font-normal text-sm">(ঐচ্ছিক)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>ফোন</Label><input name="phone" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" className="field" /></div>
            <div><Label>ইমেইল</Label><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="school@example.com" className="field" /></div>
            <div><Label>ওয়েবসাইট</Label><input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://school.edu.bd" className="field" /></div>
            <div><Label>ফেসবুক পেজ</Label><input type="url" name="facebookPage" value={form.facebookPage} onChange={handleChange} placeholder="https://facebook.com/..." className="field" /></div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-6">
          <Link href="/admin/schools" className="flex-1 text-center py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            বাতিল
          </Link>
          <button type="submit" disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />সংরক্ষণ হচ্ছে...</>) : (mode === 'create' ? 'স্কুল তৈরি করুন' : 'পরিবর্তন সংরক্ষণ করুন')}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .field { width:100%; padding:0.625rem 0.875rem; border:1px solid #e5e7eb; border-radius:0.5rem; font-size:0.875rem; outline:none; background:#fff; transition:all .15s; color:#111827; }
        .field:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.1); }
        select.field { appearance:none; background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position:right .75rem center; background-repeat:no-repeat; background-size:1.25em; padding-right:2.5rem; cursor:pointer; }
      `}</style>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}
function Req() { return <span className="text-red-500">*</span>; }
