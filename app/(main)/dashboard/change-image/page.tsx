'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWRMutation from 'swr/mutation';
import { studentsApi, teachersApi } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar } from '@/components/ui/Avatar';
import { ArrowLeft, Camera, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ChangeImagePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('ছবির সাইজ ৫ এমবির বেশি হতে পারবে না'); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const isStudent = user?.role === 'STUDENT';
  const currentImage = isStudent ? user?.studentProfile?.profileImage : user?.teacherProfile?.profileImage;
  const name = (isStudent ? user?.studentProfile?.name : user?.teacherProfile?.name) || '';

  const { trigger, isMutating } = useSWRMutation(
    'upload-image',
    async () => {
      if (!file || !user) throw new Error('No file');
      const fd = new FormData();
      fd.append('profileImage', file);
      if (isStudent) return studentsApi.updateImage(user.id, fd);
      return teachersApi.updateImage(user.id, fd);
    },
    {
      onSuccess: async () => {
        await refreshUser();
        setSuccess(true);
        setFile(null);
        setPreview('');
      },
      onError: (err: Error) => setError(err.message || 'ছবি আপলোড ব্যর্থ হয়েছে'),
    },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">ছবি পরিবর্তন</h1>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm">ছবি সফলভাবে আপলোড হয়েছে!</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Current image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {preview ? (
                <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-blue-100">
                  <Image src={preview} alt="নতুন ছবি" width={128} height={128} className="object-cover w-full h-full" />
                </div>
              ) : (
                <Avatar src={currentImage} name={name} size="xl" className="ring-4 ring-gray-100" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              ছবি নির্বাচন করুন
            </button>

            <p className="text-xs text-gray-400 text-center">
              JPG, PNG বা WebP ফরম্যাট • সর্বোচ্চ ৫ এমবি<br />
              ছবি স্বয়ংক্রিয়ভাবে ৪০০×৪০০ পিক্সেলে রিসাইজ হবে
            </p>
          </div>

          {file && (
            <button
              onClick={() => trigger()}
              disabled={isMutating}
              className="w-full mt-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isMutating ? 'আপলোড হচ্ছে...' : 'ছবি সংরক্ষণ করুন'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
