'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { schoolsApi } from '@/lib/api';
import { School } from '@/lib/types';
import {
  School as SchoolIcon, Plus, Edit, ToggleLeft, ToggleRight,
  ArrowLeft, Search, AlertCircle,
} from 'lucide-react';

export default function AdminSchoolsPage() {
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: () => schoolsApi.getAll({ limit: '100' }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => schoolsApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
      setTogglingId(null);
    },
    onError: () => setTogglingId(null),
  });

  const schools = (data?.data ?? []) as School[];
  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase()) ||
      s.division.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = (id: string) => {
    setTogglingId(id);
    toggleMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-bold text-gray-900">সব স্কুল</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              {schools.length}টি
            </span>
          </div>
          <Link
            href="/admin/schools/create"
            className="flex items-center gap-1.5 text-sm text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            নতুন স্কুল
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="নাম, জেলা বা বিভাগ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <SchoolIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{search ? 'কোনো ফলাফল পাওয়া যায়নি।' : 'এখনো কোনো স্কুল নেই।'}</p>
              {!search && (
                <Link href="/admin/schools/create" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
                  প্রথম স্কুল তৈরি করুন →
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">স্কুল</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">EIIN</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">জেলা / বিভাগ</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">স্থাপিত</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">অবস্থা</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {school.logo ? (
                              <img src={school.logo} alt={school.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                <SchoolIcon className="h-4 w-4 text-indigo-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{school.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500">{school.eiin || '—'}</td>
                        <td className="px-5 py-4 text-gray-500">{school.district}, {school.division}</td>
                        <td className="px-5 py-4 text-gray-500">{school.establishedYear}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {school.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggle(school.id)}
                              disabled={togglingId === school.id}
                              title={school.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                              className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                                school.isActive
                                  ? 'text-red-500 border-red-200 hover:bg-red-50'
                                  : 'text-green-600 border-green-200 hover:bg-green-50'
                              }`}
                            >
                              {school.isActive
                                ? <ToggleLeft className="h-4 w-4" />
                                : <ToggleRight className="h-4 w-4" />}
                            </button>
                            <Link
                              href={`/admin/schools/${school.id}/edit`}
                              className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              সম্পাদনা
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filtered.map((school) => (
                  <div key={school.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {school.logo ? (
                        <img src={school.logo} alt={school.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                          <SchoolIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{school.name}</p>
                        <p className="text-xs text-gray-400">{school.district}, {school.division} • {school.establishedYear}</p>
                      </div>
                      <span className={`ml-auto shrink-0 text-xs px-2 py-1 rounded-full font-medium ${school.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {school.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(school.id)}
                        disabled={togglingId === school.id}
                        className={`flex-1 text-xs py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                          school.isActive
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {school.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                      </button>
                      <Link
                        href={`/admin/schools/${school.id}/edit`}
                        className="flex-1 text-xs text-center py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        সম্পাদনা করুন
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
