'use client';

import { UserSidebar } from '@/components/layout/UserSidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* UserSidebar renders the mobile top navbar + bottom tabbar + desktop sidebar */}
      <UserSidebar />

      {/* Page content */}
      <div className="lg:pl-60 flex flex-col min-h-screen bg-gray-50">
        {/* pt-14 = mobile top navbar height, pb-16 = bottom tab bar height */}
        <main className="flex-1 pt-14 pb-16 lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>
    </>
  );
}
