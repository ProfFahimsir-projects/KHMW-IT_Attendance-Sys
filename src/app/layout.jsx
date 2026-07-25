import './globals.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'KHMW College of Commerce | Attendance Management System',
  description: 'Production-grade enterprise college attendance portal for KHMW College of Commerce.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
