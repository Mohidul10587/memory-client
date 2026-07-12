'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ChangePhonePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const validatePhone = (phone: string) => /^01[3-9]\d{8}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(newPhone)) {
      setError('সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)');
      return;
    }
    if (newPhone === user?.phone) {
      setError('নতুন নম্বর বর্তমান নম্বরের মতো');
      return;
    }
    if (!currentPassword) {
      setError('পাসওয়ার্ড দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePhone(currentPassword, newPhone);
      setSuccess(true);
      // Sessions are invalidated on server — log out locally after 2s
      setTimeout(async () => {
        await logout();
        router.push('/login');
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'কিছু একটা সমস্যা হয়েছে';
      if (msg.toLowerCase().includes('incorrect')) {
        setError('পাসওয়ার্ড ভুল');
      } else if (msg.toLowerCase().includes('already')) {
        setError('এই ফোন নম্বরটি অন্য অ্যাকাউন্টে ব্যবহার হচ্ছে');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">ফোন নম্বর পরিবর্তন</h1>
        </div>

        {/* Success */}
        {success && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">ফোন নম্বর সফলভাবে পরিবর্তন হয়েছে!</p>
              <p className="text-xs mt-0.5 text-green-600">নিরাপত্তার জন্য লগআউট হচ্ছে, পুনরায় লগইন করুন…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Current phone info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">বর্তমান ফোন নম্বর</p>
              <p className="text-sm font-semibold text-gray-800 font-mono">{user?.phone}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                নতুন ফোন নম্বর
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">বাংলাদেশি নম্বর, যেমন: 01712345678</p>
            </div>

            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                বর্তমান পাসওয়ার্ড <span className="text-gray-400 font-normal">(নিশ্চিত করতে)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Warning note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700">
                ⚠️ ফোন নম্বর পরিবর্তনের পর সব ডিভাইস থেকে লগআউট হয়ে যাবে এবং নতুন নম্বর দিয়ে লগইন করতে হবে।
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
            >
              {isSubmitting ? 'পরিবর্তন হচ্ছে...' : 'ফোন নম্বর পরিবর্তন করুন'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
