'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Header({ user, title }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-card/70 px-6 backdrop-blur-md transition-colors">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title || 'Dashboard'}</h1>
        <p className="text-xs text-muted-foreground">KHMW College of Commerce Attendance System</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative rounded-lg border border-border bg-muted/40 p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          title="Toggle Theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute left-2 top-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>

        {/* User Identity Chip */}
        {user && (
          <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-3.5 w-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-semibold text-foreground">{user.name}</span>
              <span className="block text-[10px] text-muted-foreground">{user.role}</span>
            </div>
          </div>
        )}

        {/* Logout CTA */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
