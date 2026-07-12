import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-xs' },
  md: { container: 'h-12 w-12', icon: 'h-6 w-6', text: 'text-sm' },
  lg: { container: 'h-20 w-20', icon: 'h-10 w-10', text: 'text-xl' },
  xl: { container: 'h-28 w-28', icon: 'h-14 w-14', text: 'text-2xl' },
};

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const { container, icon, text } = sizes[size];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div className={`relative ${container} shrink-0 overflow-hidden rounded-full ${className}`}>
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${container} shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${className}`}
    >
      {initials ? (
        <span className={`${text} font-semibold text-white`}>{initials}</span>
      ) : (
        <User className={`${icon} text-white`} />
      )}
    </div>
  );
}
