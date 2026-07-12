import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { BloodGroup } from '@/lib/types';

// ─── Fallback (initials) ──────────────────────────────────────────────────────

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = [
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-indigo-600',
    'from-green-400 to-green-600',
    'from-teal-400 to-teal-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${color}`}>
      <span className="text-white font-bold text-3xl select-none">{initials}</span>
    </div>
  );
}

// ─── Shared Card Shell ────────────────────────────────────────────────────────

function PersonCard({
  userId,
  name,
  profileImage,
  phone,
  accentColor,
}: {
  userId: string;
  name: string;
  profileImage?: string | null;
  phone?: string;
  accentColor: 'blue' | 'green';
}) {
  const linkColor =
    accentColor === 'blue'
      ? 'text-blue-600 hover:text-blue-700'
      : 'text-green-600 hover:text-green-700';

  return (
    <Link
      href={`/profile/${userId}`}
      className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all duration-200"
    >
      {/* Photo */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 shrink-0">
        {profileImage ? (
          <Image
            src={profileImage}
            alt={name}
            fill
            className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <AvatarFallback name={name} />
        )}
      </div>

      {/* Name + info */}
      <div className="px-3 py-3 flex flex-col gap-1">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{name}</p>

        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{phone}</span>
          </div>
        )}

        <span className={`mt-1 text-xs font-medium ${linkColor}`}>বিস্তারিত →</span>
      </div>
    </Link>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────

interface StudentCardProps {
  userId: string;
  name: string;
  profileImage?: string | null;
  sscPassingYear: number;
  profession?: string | null;
  bloodGroup?: BloodGroup | null;
  phone?: string;
}

export function StudentCard({ userId, name, profileImage, phone }: StudentCardProps) {
  return (
    <PersonCard
      userId={userId}
      name={name}
      profileImage={profileImage}
      phone={phone}
      accentColor="blue"
    />
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────

interface TeacherCardProps {
  userId: string;
  name: string;
  profileImage?: string | null;
  designation: string;
  subject: string;
  joiningYear: number;
  bloodGroup?: BloodGroup | null;
}

export function TeacherCard({ userId, name, profileImage }: TeacherCardProps) {
  return (
    <PersonCard
      userId={userId}
      name={name}
      profileImage={profileImage}
      accentColor="green"
    />
  );
}
