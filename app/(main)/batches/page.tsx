'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { studentsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BatchInfo } from '@/lib/types';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BatchesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading } = useSWR(
    isAuthenticated ? 'batches' : null,
    () => studentsApi.getBatches(),
    { revalidateOnFocus: false },
  );

  const batches = (data?.data as BatchInfo[]) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">শিক্ষার্থীদের ব্যাচসমূহ</h1>
          {batches.length > 0 && (
            <span className="ml-auto text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              মোট {batches.length}টি ব্যাচ
            </span>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : batches.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">কোনো ব্যাচ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {batches.map((batch) => (
              <Link key={batch.year} href={`/batch/${batch.year}`}>
                <div className="rounded-xl border border-gray-100 bg-white p-5 text-center hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                  <p className="text-3xl font-bold text-blue-600">{batch.year}</p>
                  <p className="text-xs text-gray-500 mt-1.5">{batch.count} জন শিক্ষার্থী</p>
                  <p className="text-xs text-gray-400 mt-0.5">এসএসসি ব্যাচ</p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
