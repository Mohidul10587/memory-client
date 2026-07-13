'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { studentsApi, teachersApi } from '@/lib/api';
import { StudentCard, TeacherCard } from '@/components/profile/ProfileCards';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BatchInfo, StudentProfile, TeacherProfile } from '@/lib/types';
import { Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';

// Fisher-Yates shuffle — new array প্রতিবার render-এ random order
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role === 'SUPER_ADMIN') { router.push('/admin'); return; }
  }, [authLoading, isAuthenticated, user, router]);

  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';
  const myBatchYear = user?.studentProfile?.sscPassingYear;

  // My batch (students only) — no limit, fetch all
  const { data: myBatchData, isLoading: myBatchLoading } = useSWR(
    isAuthenticated && isStudent && myBatchYear ? ['my-batch', myBatchYear] : null,
    () => studentsApi.getByBatch(myBatchYear!),
    { revalidateOnFocus: false },
  );

  // All batches
  const { data: batchesData, isLoading: batchesLoading } = useSWR(
    isAuthenticated ? 'batches' : null,
    () => studentsApi.getBatches(),
    { revalidateOnFocus: false },
  );

  // Teachers — only for TEACHER role on home
  const { data: teachersData, isLoading: teachersLoading } = useSWR(
    isAuthenticated && isTeacher ? 'teachers-home' : null,
    () => teachersApi.getAll({ limit: '12' }),
    { revalidateOnFocus: false },
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="লোড হচ্ছে..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const batches = (batchesData?.data as BatchInfo[]) || [];
  const otherBatches = isStudent ? batches.filter((b) => b.year !== myBatchYear) : batches;
  const teachers = (teachersData?.data as (TeacherProfile & { user: { id: string; phone: string } })[]) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">

        {/* School banner */}
        {user?.school && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <p className="text-blue-100 text-sm">আপনার স্কুল</p>
            <h2 className="text-2xl font-bold mt-1">{user.school.name}</h2>
            <p className="text-blue-200 text-sm mt-1">
              {isStudent
                ? `শিক্ষার্থী • এসএসসি ${myBatchYear}`
                : `শিক্ষক • ${user.teacherProfile?.designation}`}
            </p>
          </div>
        )}

        {/* ── TEACHER view: colleagues first ── */}
        {isTeacher && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                অন্যান্য শিক্ষকবৃন্দ
              </h2>
              <Link href="/teachers" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                সবাইকে দেখুন →
              </Link>
            </div>
            {teachersLoading ? (
              <LoadingSpinner />
            ) : teachers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">কোনো শিক্ষক পাওয়া যায়নি</p>
            ) : (
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
            )}
          </section>
        )}

        {/* ── STUDENT view: own batch first ── */}
        {isStudent && myBatchYear && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                আমার এসএসসি ব্যাচ — {myBatchYear}
              </h2>
            </div>
            {myBatchLoading ? (
              <LoadingSpinner />
            ) : !myBatchData?.data?.length ? (
              <p className="text-center text-gray-500 py-8">কোনো সহপাঠী পাওয়া যায়নি</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {shuffleArray(myBatchData.data as (StudentProfile & { user: { id: string; phone: string } })[]).map((s) => (
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
            )}
          </section>
        )}

        {/* ── All / Other Batches ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            {isStudent ? 'অন্যান্য ব্যাচ' : 'শিক্ষার্থীদের ব্যাচসমূহ'}
          </h2>
          {batchesLoading ? (
            <LoadingSpinner />
          ) : otherBatches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">কোনো ব্যাচ পাওয়া যায়নি</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {otherBatches.map((batch) => (
                <Link key={batch.year} href={`/batch/${batch.year}`}>
                  <div className="rounded-xl border border-gray-100 bg-white p-4 text-center hover:border-blue-200 hover:shadow-sm transition-all">
                    <p className="text-2xl font-bold text-blue-600">{batch.year}</p>
                    <p className="text-xs text-gray-500 mt-1">{batch.count} জন শিক্ষার্থী</p>
                    <p className="text-xs text-gray-400 mt-0.5">এসএসসি ব্যাচ</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

    </div>
  );
}
