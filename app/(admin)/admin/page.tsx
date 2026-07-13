'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { schoolsApi, adminUsersApi } from '@/lib/api';
import { School } from '@/lib/types';
import {
  School as SchoolIcon, Plus, Users, ToggleLeft, ToggleRight,
  GraduationCap, BookOpen,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: () => schoolsApi.getAll({ limit: '100' }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminUsersApi.getStats(),
  });

  const schools = (data?.data ?? []) as School[];
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.isActive).length;
  const inactiveSchools = totalSchools - activeSchools;
  const stats = statsData?.data as any;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">স্বাগতম, Super Admin 👋</h1>
        <p className="text-sm text-gray-500 mt-1">সকল স্কুল পরিচালনা করুন এখান থেকে।</p>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'মোট স্কুল', value: isLoading ? '...' : totalSchools, color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <SchoolIcon className="h-5 w-5" /> },
            { label: 'সক্রিয় স্কুল', value: isLoading ? '...' : activeSchools, color: 'bg-green-50 text-green-700 border-green-100', icon: <ToggleRight className="h-5 w-5" /> },
            { label: 'নিষ্ক্রিয় স্কুল', value: isLoading ? '...' : inactiveSchools, color: 'bg-red-50 text-red-700 border-red-100', icon: <ToggleLeft className="h-5 w-5" /> },
            { label: 'শিক্ষার্থী', value: stats ? stats.totalStudents : '...', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <GraduationCap className="h-5 w-5" /> },
            { label: 'শিক্ষক', value: stats ? stats.totalTeachers : '...', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: <BookOpen className="h-5 w-5" /> },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-4 p-5 rounded-2xl border ${stat.color}`}>
              <div className="shrink-0">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-70">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/schools"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">সব স্কুল দেখুন</p>
              <p className="text-sm text-gray-500">স্কুল সম্পাদনা ও পরিচালনা করুন</p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">সব ইউজার দেখুন</p>
              <p className="text-sm text-gray-500">ইউজার আপডেট ও পরিচালনা করুন</p>
            </div>
          </Link>

          <Link
            href="/admin/schools/create"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">নতুন স্কুল যোগ করুন</p>
              <p className="text-sm text-gray-500">নতুন স্কুল তৈরি করুন</p>
            </div>
          </Link>
        </div>

        {/* Recent Schools */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">সাম্প্রতিক স্কুলসমূহ</h2>
            <Link href="/admin/schools" className="text-sm text-indigo-600 hover:underline">সব দেখুন →</Link>
          </div>
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : schools.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <SchoolIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>এখনো কোনো স্কুল নেই।</p>
              <Link href="/admin/schools/create" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">প্রথম স্কুল তৈরি করুন →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {schools.slice(0, 5).map((school) => (
                <div key={school.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    {school.logo ? (
                      <img src={school.logo} alt={school.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <SchoolIcon className="h-5 w-5 text-indigo-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{school.name}</p>
                      <p className="text-xs text-gray-400">{school.district}, {school.division}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {school.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                    <Link
                      href={`/admin/schools/${school.id}/edit`}
                      className="text-xs text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      সম্পাদনা
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
