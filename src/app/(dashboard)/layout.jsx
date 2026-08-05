'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me?basic=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.user) {
          setUser(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar navigation */}
      <Sidebar userRole={user?.role || 'ADMIN'} />

      {/* Main content body */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        <Header user={user} title={user?.role === 'ADMIN' ? 'Admin Workspace' : 'Professor Workspace'} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
