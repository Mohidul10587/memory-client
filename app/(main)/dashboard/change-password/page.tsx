'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWRMutation from 'swr/mutation';
import { authApi } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const { trigger, isMutating } = useSWRMutation(
    'change-password',
    () => authApi.changePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        setSuccess(true);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      },
      onError: (err: Error) => {
        setError(err.message.includes('incorrect') ? 'বর্তমান পাসওয়ার্ড ভুল' : err.message);
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (newPassword.length < 6) { setError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return; }
    if (newPassword !== confirmPassword) { setError('নতুন পাসওয়ার্ড দুটি মিলছে না'); return; }
    trigger();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">পাসওয়ার্ড পরিবর্তন</h1>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm">পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">বর্তমান পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="বর্তমান পাসওয়ার্ড"
                className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                className="w-full px-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isMutating}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {isMutating ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
          </button>
        </form>
      </main>
    </div>
  );
}
