'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import {
  Home, Search, Users, GraduationCap, User, LogOut,
  X, Menu, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

function useNavItems() {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';

  return [
    { href: '/', icon: Home, label: 'হোম' },
    { href: '/search', icon: Search, label: 'অনুসন্ধান' },
    ...(isStudent ? [{ href: '/teachers', icon: Users, label: 'শিক্ষকবৃন্দ' }] : []),
    ...(isTeacher ? [{ href: '/batches', icon: GraduationCap, label: 'শিক্ষার্থীরা' }] : []),
    { href: '/dashboard', icon: User, label: 'প্রোফাইল' },
  ];
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const navItems = useNavItems();

  const profileName = user?.studentProfile?.name || user?.teacherProfile?.name || 'ব্যবহারকারী';
  const profileImage = user?.studentProfile?.profileImage || user?.teacherProfile?.profileImage;

  const handleLogout = async () => {
    onClose?.();
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5 min-w-0">
          <Image src="/logo.svg" alt="লোগো" width={32} height={32} className="rounded-lg shrink-0" />
          <span className="font-bold text-gray-900 text-sm truncate">
            {user?.school?.name || 'স্কুল অ্যালামনাই'}
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-2 shrink-0">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile pill */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <Link href="/dashboard" onClick={onClose}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <Avatar src={profileImage} name={profileName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profileName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.phone}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100 shrink-0">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="h-4 w-4 shrink-0" />
          লগআউট
        </button>
      </div>
    </div>
  );
}

export function UserSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const navItems = useNavItems();

  const profileName = user?.studentProfile?.name || user?.teacherProfile?.name || 'ব্যবহারকারী';
  const profileImage = user?.studentProfile?.profileImage || user?.teacherProfile?.profileImage;

  return (
    <>
      {/* ── Desktop: fixed sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile: fixed top navbar ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <Image src="/logo.svg" alt="লোগো" width={32} height={32} className="rounded-lg shrink-0" />
          <span className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
            {user?.school?.name || 'স্কুল অ্যালামনাই'}
          </span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors shrink-0"
          aria-label="মেনু খুলুন"
        >
          <Avatar src={profileImage} name={profileName} size="sm" />
        </button>
      </header>

      {/* ── Mobile: fixed bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 flex items-center justify-around px-1 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                active ? 'text-blue-600' : 'text-gray-400'
              }`}>
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-gray-400"
          aria-label="আরও"
        >
          <Menu className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-medium">আরও</span>
        </button>
      </nav>

      {/* ── Mobile: drawer ── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl">
            <SidebarContent onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
