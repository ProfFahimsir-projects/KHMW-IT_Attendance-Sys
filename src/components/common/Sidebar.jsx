'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  ClipboardCheck,
  FileText,
  Settings,
  UserCheck,
  Menu,
  X,
  School,
  Clock,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Sidebar({ userRole = 'ADMIN' }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Professors', href: '/admin/professors', icon: UserCheck },
    { name: 'Students', href: '/admin/students', icon: GraduationCap },
    { name: 'Classes', href: '/admin/classes', icon: School },
    { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
    { name: 'Academic Years', href: '/admin/academic-years', icon: Calendar },
    { name: 'Timetable', href: '/admin/timetable', icon: Clock },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Attendance Hub', href: '/admin/attendance-management', icon: ClipboardCheck },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const professorLinks = [
    { name: 'Dashboard', href: '/professor/dashboard', icon: LayoutDashboard },
    { name: 'Take Attendance', href: '/professor/take-attendance', icon: ClipboardCheck },
    { name: 'Timetable', href: '/professor/timetable', icon: Clock },
    { name: 'Assigned Classes', href: '/professor/assigned-classes', icon: School },
    { name: 'Assigned Subjects', href: '/professor/assigned-subjects', icon: BookOpen },
    { name: 'Student Profiles', href: '/professor/student-profiles', icon: GraduationCap },
    { name: 'View Reports', href: '/professor/reports', icon: FileText },
    { name: 'My Profile', href: '/professor/profile', icon: UserCircle },
  ];

  const links = userRole === 'ADMIN' ? adminLinks : professorLinks;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md">
            <School className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">KHMW COLLEGE</h2>
            <p className="text-[10px] font-semibold text-primary">Commerce Portal</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {userRole} MENU
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/60 p-4 text-center text-[10px] text-muted-foreground">
          <p>© 2026 KHMW College</p>
          <p className="font-mono">v1.0 Enterprise</p>
        </div>
      </aside>
    </>
  );
}
