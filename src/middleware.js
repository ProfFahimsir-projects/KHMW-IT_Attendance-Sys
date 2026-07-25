import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  let decodedUser = null;
  if (token) {
    decodedUser = await verifyToken(token);
  }

  // Guard /admin routes
  if (pathname.startsWith('/admin')) {
    if (!decodedUser) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    if (decodedUser.role !== 'ADMIN') {
      // Redirect professors trying to access admin routes to professor dashboard
      return NextResponse.redirect(new URL('/professor/dashboard', request.url));
    }
  }

  // Guard /professor routes
  if (pathname.startsWith('/professor')) {
    if (!decodedUser) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    // Allow both PROFESSOR and ADMIN to view professor routes if needed
  }

  // Redirect authenticated user away from /login page to their default dashboard
  if ((pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password') && decodedUser) {
    if (decodedUser.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/professor/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/professor/:path*', '/login', '/forgot-password', '/reset-password'],
};
