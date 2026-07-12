'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { teachersApi } from '@/lib/api';
import { TeacherCard } from '@/components/profile/ProfileCards';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { Navbar } from '@/components/layout/Navbar';
import { TeacherProfile } from '@/lib/types';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TeachersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading } = useSWR(
    isAuthenticated ? ['teachers', page] : null,
    () => teachersApi.getAll({ page: String(page), limit: '24', sortBy: 'name', sortOrder: 'asc' }),
    { revalidateOnFocus: false },
  );

  const teachers = (data?.data as (TeacherProfile & { user: { id: string; phone: string } })[]) || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <Users className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">শিক্ষকবৃন্দ</h1>
          {meta && (
            <span className="ml-auto text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              মোট {meta.total} জন
            </span>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : teachers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">কোনো শিক্ষক পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {teachers.map((t) => (
                <TeacherCard
                  key={t.id}
                  userId={t.user.id}
                  name={t.name}
                  profileImage={t.profileImage}
                  designation={t.designation}
                  subject={t.subject}
                  joiningYear={t.joiningYear}
                  bloodGroup={t.bloodGroup}
                />
              ))}
            </div>
            {meta && <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </main>
    </div>
  );
}
