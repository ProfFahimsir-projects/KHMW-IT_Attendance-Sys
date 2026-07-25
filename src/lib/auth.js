import { verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function getAuthUser(request) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded;
}

export async function requireAuth(request, allowedRoles = []) {
  const user = await getAuthUser(request);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Unauthorized: Session expired or invalid token.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient privileges for this action.' },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
