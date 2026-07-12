'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminUsersApi, schoolsApi } from '@/lib/api';
import { User, School, BLOOD_GROUP_LABELS } from '@/lib/types';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Filter,
  X,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'শিক্ষার্থী',
  TEACHER: 'শিক্ষক',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const params: Record<string, string> = {
    page: String(page),
    limit: '20',
  };
  if (search) params.search = search;
  if (role) params.role = role;
  if (schoolId) params.schoolId = schoolId;
  if (division) params.division = division;
  if (district) params.district = district;
  if (upazila) params.upazila = upazila;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminUsersApi.getAll(params),
  });

  const { data: schoolsData } = useQuery({
    queryKey: ['schools-dropdown'],
    queryFn: () => schoolsApi.getDropdown(),
  });

  const users = (data?.data ?? []) as User[];
  const meta = data?.meta;
  const schools = (schoolsData?.data ?? []) as School[];

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => adminUsersApi.toggleActive(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminUsersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setConfirmDelete(null);
    },
  });

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setSchoolId('');
    setDivision('');
    setDistrict('');
    setUpazila('');
    setPage(1);
  };

  const hasFilters = search || role || schoolId || division || district || upazila;

  const getDisplayName = (user: User) =>
    user.studentProfile?.name ?? user.teacherProfile?.name ?? '—';

  const getLocation = (user: User) => {
    const profile = user.studentProfile ?? user.teacherProfile;
    if (!profile) return null;
    const parts = [profile.upazila, profile.district, profile.division].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">সব ইউজার</span>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {meta ? `মোট ${meta.total} জন` : '...'}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Search + Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="নাম বা ফোন নম্বর খুঁজুন..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || hasFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            ফিল্টার
            {hasFilters && (
              <span className="bg-white text-indigo-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">ফিল্টার</span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                  সব মুছুন
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Role */}
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">সব ভূমিকা</option>
                <option value="STUDENT">শিক্ষার্থী</option>
                <option value="TEACHER">শিক্ষক</option>
              </select>

              {/* School */}
              <select
                value={schoolId}
                onChange={(e) => { setSchoolId(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">সব স্কুল</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Division */}
              <input
                type="text"
                placeholder="বিভাগ (যেমন: বরিশাল)"
                value={division}
                onChange={(e) => { setDivision(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* District */}
              <input
                type="text"
                placeholder="জেলা (যেমন: পিরোজপুর)"
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Upazila */}
              <input
                type="text"
                placeholder="উপজেলা (যেমন: কাউখালী)"
                value={upazila}
                onChange={(e) => { setUpazila(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* User List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">কোনো ইউজার পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      নাম
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      ফোন
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      ভূমিকা
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                      স্কুল
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                      এলাকা
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      অবস্থা
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => {
                    const profile = user.studentProfile ?? user.teacherProfile;
                    const location = getLocation(user);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Name + avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {profile?.profileImage ? (
                              <img
                                src={profile.profileImage}
                                alt={getDisplayName(user)}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                <span className="text-indigo-600 font-semibold text-sm">
                                  {getDisplayName(user).charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{getDisplayName(user)}</p>
                              {'sscPassingYear' in (profile ?? {}) && (
                                <p className="text-xs text-gray-400">
                                  SSC {(profile as any).sscPassingYear}
                                </p>
                              )}
                              {'designation' in (profile ?? {}) && (
                                <p className="text-xs text-gray-400">
                                  {(profile as any).designation}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">
                          {user.phone}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                              user.role === 'STUDENT'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {user.role === 'STUDENT' ? (
                              <GraduationCap className="h-3 w-3" />
                            ) : (
                              <BookOpen className="h-3 w-3" />
                            )}
                            {ROLE_LABELS[user.role] ?? user.role}
                          </span>
                        </td>

                        {/* School */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <p className="text-gray-700 text-xs max-w-[160px] truncate">
                            {user.school?.name ?? '—'}
                          </p>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <p className="text-gray-500 text-xs">{location ?? '—'}</p>
                        </td>

                        {/* Active status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit */}
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="সম্পাদনা"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            {/* Toggle active */}
                            <button
                              onClick={() => toggleMutation.mutate(user.id)}
                              disabled={toggleMutation.isPending}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors disabled:opacity-50"
                              title={user.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                            >
                              {user.isActive ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="মুছুন"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              পৃষ্ঠা {meta.page} / {meta.totalPages} (মোট {meta.total} জন)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrev}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                আগে
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNext}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                পরে
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">ইউজার মুছবেন?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              এই কার্যক্রম স্থায়ী। ইউজারের সব ডেটা মুছে যাবে এবং ফিরিয়ে আনা যাবে না।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDelete)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'মুছছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
