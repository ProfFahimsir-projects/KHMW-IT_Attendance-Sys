import { clearTokenCookie } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  clearTokenCookie(response);
  return response;
}
