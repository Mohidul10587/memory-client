'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, School, Users, LogOut, X, Menu, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { href: '/admin/schools', icon: School, label: 'স্কুলসমূহ' },
  { href: '/admin/users', icon: Users, label: 'ব্যবহারকারী' },
];

function SidebarContent({
  pathname,
  user,
  onLogout,
  onClose,
}: {
  pathname: string;
  user: { phone?: string } | null;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 shrink-0">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="লোগো" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-white text-sm">Super Admin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="px-3 pb-4 shrink-0 border-t border-white/10 pt-3">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-white/40">লগইন করেছেন</p>
          <p className="text-sm text-white/80 font-medium truncate">{user?.phone}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          লগআউট
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* ── Desktop sidebar (fixed, always visible on lg+) ── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-gradient-to-b from-indigo-700 to-indigo-900 z-30">
        <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile: fixed top bar with hamburger ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-indigo-800 flex items-center justify-between px-4 h-14 shadow-md">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="লোগো" width={30} height={30} className="rounded-lg" />
          <span className="font-bold text-white text-sm">Super Admin</span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="মেনু খুলুন"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 lg:hidden shadow-2xl">
            <SidebarContent
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
