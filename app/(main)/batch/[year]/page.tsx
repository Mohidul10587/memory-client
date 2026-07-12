'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { studentsApi } from '@/lib/api';
import { StudentCard } from '@/components/profile/ProfileCards';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { Navbar } from '@/components/layout/Navbar';
import { StudentProfile } from '@/lib/types';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function BatchPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading } = useSWR(
    isAuthenticated ? ['batch', year, page] : null,
    () => studentsApi.getByBatch(parseInt(year), { page: String(page), limit: '24' }),
    { revalidateOnFocus: false },
  );

  const students = (data?.data as (StudentProfile & { user: { id: string; phone: string } })[]) || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">এসএসসি ব্যাচ — {year}</h1>
          </div>
          {meta && (
            <span className="ml-auto text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              মোট {meta.total} জন
            </span>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">এই ব্যাচে কোনো শিক্ষার্থী পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {students.map((s) => (
                <StudentCard
                  key={s.id}
                  userId={s.user.id}
                  name={s.name}
                  profileImage={s.profileImage}
                  sscPassingYear={s.sscPassingYear}
                  profession={s.profession}
                  bloodGroup={s.bloodGroup}
                  phone={s.user.phone}
                />
              ))}
            </div>
            {meta && (
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
