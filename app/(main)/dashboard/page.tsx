'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar } from '@/components/ui/Avatar';
import { BLOOD_GROUP_LABELS } from '@/lib/types';
import {
  User, Edit, KeyRound, Camera, Phone, MapPin, Mail, Briefcase,
  Facebook, Droplets, BookOpen, GraduationCap, LogOut,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || !user) return null;

  const isStudent = user.role === 'STUDENT';
  const profile = isStudent ? user.studentProfile : user.teacherProfile;
  const name = profile?.name || 'ব্যবহারকারী';
  const image = profile?.profileImage;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`h-24 ${isStudent ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-teal-600'}`} />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <Avatar src={image} name={name} size="xl" className="ring-4 ring-white" />
              <Link
                href="/dashboard/edit"
                className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                সম্পাদনা
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isStudent
                ? `শিক্ষার্থী • এসএসসি ${user.studentProfile?.sscPassingYear}`
                : `${user.teacherProfile?.designation} • ${user.teacherProfile?.subject}`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{user.school?.name}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/edit', icon: <Edit className="h-5 w-5" />, label: 'প্রোফাইল সম্পাদনা', color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { href: '/dashboard/change-password', icon: <KeyRound className="h-5 w-5" />, label: 'পাসওয়ার্ড পরিবর্তন', color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { href: '/dashboard/change-phone', icon: <Phone className="h-5 w-5" />, label: 'ফোন নম্বর পরিবর্তন', color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { href: '/dashboard/change-image', icon: <Camera className="h-5 w-5" />, label: 'ছবি পরিবর্তন', color: 'text-green-600 bg-green-50 border-green-100' },
            { href: `/profile/${user.id}`, icon: <User className="h-5 w-5" />, label: 'আমার প্রোফাইল', color: 'text-orange-600 bg-orange-50 border-orange-100' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all hover:shadow-sm ${item.color}`}
            >
              {item.icon}
              <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Profile Info */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">প্রোফাইল তথ্য</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<Phone className="h-4 w-4 text-blue-500" />} label="ফোন" value={user.phone} />
              {profile.email && <InfoRow icon={<Mail className="h-4 w-4 text-orange-500" />} label="ইমেইল" value={profile.email} />}
              {profile.bloodGroup && (
                <InfoRow
                  icon={<Droplets className="h-4 w-4 text-red-500" />}
                  label="রক্তের গ্রুপ"
                  value={BLOOD_GROUP_LABELS[profile.bloodGroup]}
                />
              )}
              {isStudent && user.studentProfile?.profession && (
                <InfoRow icon={<Briefcase className="h-4 w-4 text-purple-500" />} label="পেশা" value={user.studentProfile.profession} />
              )}
              {isStudent && user.studentProfile?.workplace && (
                <InfoRow icon={<Briefcase className="h-4 w-4 text-indigo-500" />} label="কর্মস্থল" value={user.studentProfile.workplace} />
              )}
              {!isStudent && (
                <>
                  <InfoRow icon={<BookOpen className="h-4 w-4 text-green-500" />} label="বিষয়" value={user.teacherProfile!.subject} />
                  <InfoRow icon={<GraduationCap className="h-4 w-4 text-teal-500" />} label="যোগদানের সাল" value={String(user.teacherProfile!.joiningYear)} />
                </>
              )}
              {profile.currentAddress && (
                <InfoRow icon={<MapPin className="h-4 w-4 text-teal-500" />} label="বর্তমান ঠিকানা" value={profile.currentAddress} />
              )}
              {profile.permanentAddress && (
                <InfoRow icon={<MapPin className="h-4 w-4 text-gray-400" />} label="স্থায়ী ঠিকানা" value={profile.permanentAddress} />
              )}
              {profile.facebookProfile && (
                <InfoRow icon={<Facebook className="h-4 w-4 text-blue-600" />} label="ফেসবুক" value="প্রোফাইল দেখুন" href={profile.facebookProfile} />
              )}
            </div>
            {profile.about && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">নিজের সম্পর্কে</p>
                <p className="text-sm text-gray-700">{profile.about}</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          লগআউট
        </button>
      </main>
    </div>
  );
}

function InfoRow({
  icon, label, value, href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
        {content}
      </a>
    );
  }
  return content;
}
