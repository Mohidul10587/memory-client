'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { schoolsApi } from '@/lib/api';
import { School } from '@/lib/types';
import SchoolForm from '@/components/admin/SchoolForm';

export default function EditSchoolPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['school', id],
    queryFn: () => schoolsApi.getOne(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const school = data?.data as School | undefined;

  if (!school) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">স্কুল পাওয়া যায়নি।</p>
      </div>
    );
  }

  return <SchoolForm mode="edit" school={school} />;
}
