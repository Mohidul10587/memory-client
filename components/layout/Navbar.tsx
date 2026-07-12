'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Home, Search, Users, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const profileName =
    user?.studentProfile?.name || user?.teacherProfile?.name || 'ব্যবহারকারী';
  const profileImage =
    user?.studentProfile?.profileImage || user?.teacherProfile?.profileImage;

  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';

  const navLink = (href: string, icon: React.ReactNode, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`hidden sm:flex items-center gap-1.5 text-sm transition-colors ${
          active ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">অ্যা</span>
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">
            {user?.school?.name || 'স্কুল অ্যালামনাই'}
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {/* Nav links */}
            {navLink('/', <Home className="h-4 w-4" />, 'হোম')}
            {navLink('/search', <Search className="h-4 w-4" />, 'অনুসন্ধান')}

            {/* Students see a Teachers link in navbar */}
            {isStudent && navLink('/teachers', <Users className="h-4 w-4" />, 'শিক্ষকবৃন্দ')}

            {/* Teachers see a Students/Batches link */}
            {isTeacher && navLink('/batches', <GraduationCap className="h-4 w-4" />, 'শিক্ষার্থীরা')}

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full hover:bg-gray-50 p-1 transition-colors"
              >
                <Avatar src={profileImage} name={profileName} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                  {profileName}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{profileName}</p>
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      আমার প্রোফাইল
                    </Link>
                    {/* Mobile-only nav items */}
                    <Link href="/search" onClick={() => setMenuOpen(false)}
                      className="sm:hidden flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Search className="h-4 w-4" />
                      অনুসন্ধান
                    </Link>
                    {isStudent && (
                      <Link href="/teachers" onClick={() => setMenuOpen(false)}
                        className="sm:hidden flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Users className="h-4 w-4" />
                        শিক্ষকবৃন্দ
                      </Link>
                    )}
                    {isTeacher && (
                      <Link href="/batches" onClick={() => setMenuOpen(false)}
                        className="sm:hidden flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <GraduationCap className="h-4 w-4" />
                        শিক্ষার্থীরা
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="h-4 w-4" />
                      লগআউট
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 transition-colors">
              লগইন
            </Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              নিবন্ধন
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
