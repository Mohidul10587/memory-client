'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';
import { studentsApi, teachersApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BLOOD_GROUP_LABELS, StudentProfile, TeacherProfile, User } from '@/lib/types';
import Image from 'next/image';
import {
  Phone, MapPin, Briefcase, Mail, Facebook, Droplets, BookOpen,
  GraduationCap, ArrowLeft, Edit,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // Try student first
  const { data: studentData, isLoading: studentLoading } = useSWR(
    isAuthenticated ? ['student-profile', userId] : null,
    () => studentsApi.getOne(userId),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  // Try teacher only if student lookup failed
  const { data: teacherData, isLoading: teacherLoading } = useSWR(
    isAuthenticated && studentData && !studentData.success ? ['teacher-profile', userId] : null,
    () => teachersApi.getOne(userId),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const isMyProfile = currentUser?.id === userId;
  const profileData = studentData?.data || teacherData?.data;
  const isLoading = studentLoading || teacherLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner text="প্রোফাইল লোড হচ্ছে..." size="lg" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">প্রোফাইল পাওয়া যায়নি</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          হোমে ফিরুন
        </Link>
      </div>
    );
  }

  const userData = (profileData as { user: User }).user;
  const isStudent = userData.role === 'STUDENT';
  const profile = profileData as (StudentProfile | TeacherProfile) & { user: User };

  const name = isStudent
    ? (profile as StudentProfile).name
    : (profile as TeacherProfile).name;
  const image = isStudent
    ? (profile as StudentProfile).profileImage
    : (profile as TeacherProfile).profileImage;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ফিরে যান</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover photo / gradient */}
          <div className={`relative w-full aspect-[16/7] ${isStudent ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-teal-600'}`}>
            {/* large profile photo overlapping */}
          </div>

          {/* Profile image — full width portrait */}
          <div className="flex flex-col sm:flex-row gap-5 px-5 -mt-16 pb-5">
            <div className="relative w-32 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-md shrink-0">
              {image ? (
                <Image src={image} alt={name} fill className="object-cover object-top" sizes="128px" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white font-bold text-3xl ${isStudent ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-green-500 to-teal-600'}`}>
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 pt-16 sm:pt-20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${isStudent ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {isStudent ? (
                      <><GraduationCap className="h-3 w-3" /> শিক্ষার্থী — এসএসসি {(profile as StudentProfile).sscPassingYear}</>
                    ) : (
                      <><BookOpen className="h-3 w-3" /> {(profile as TeacherProfile).designation} — {(profile as TeacherProfile).subject}</>
                    )}
                  </span>
                </div>
                {isMyProfile && (
                  <Link href="/dashboard/edit" className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors shrink-0">
                    <Edit className="h-4 w-4" />
                    সম্পাদনা
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 pb-6 space-y-5">
            {/* About */}
            {profile.about && (
              <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{profile.about}</p>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userData.phone && (
                <InfoItem icon={<Phone className="h-4 w-4 text-blue-500" />} label="ফোন" value={userData.phone} />
              )}
              {profile.email && (
                <InfoItem icon={<Mail className="h-4 w-4 text-orange-500" />} label="ইমেইল" value={profile.email} />
              )}
              {profile.bloodGroup && (
                <InfoItem icon={<Droplets className="h-4 w-4 text-red-500" />} label="রক্তের গ্রুপ" value={BLOOD_GROUP_LABELS[profile.bloodGroup]} />
              )}
              {isStudent && (profile as StudentProfile).profession && (
                <InfoItem icon={<Briefcase className="h-4 w-4 text-purple-500" />} label="পেশা" value={(profile as StudentProfile).profession!} />
              )}
              {isStudent && (profile as StudentProfile).workplace && (
                <InfoItem icon={<Briefcase className="h-4 w-4 text-indigo-500" />} label="কর্মস্থল" value={(profile as StudentProfile).workplace!} />
              )}
              {!isStudent && (
                <InfoItem icon={<BookOpen className="h-4 w-4 text-green-500" />} label="যোগদানের সাল" value={String((profile as TeacherProfile).joiningYear)} />
              )}
              {profile.currentAddress && (
                <InfoItem icon={<MapPin className="h-4 w-4 text-teal-500" />} label="বর্তমান ঠিকানা" value={profile.currentAddress} />
              )}
              {profile.permanentAddress && (
                <InfoItem icon={<MapPin className="h-4 w-4 text-gray-500" />} label="স্থায়ী ঠিকানা" value={profile.permanentAddress} />
              )}
            </div>

            {/* Facebook */}
            {profile.facebookProfile && (
              <a href={profile.facebookProfile} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                <Facebook className="h-4 w-4" />
                ফেসবুক প্রোফাইল দেখুন
              </a>
            )}
          </div>
        </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
