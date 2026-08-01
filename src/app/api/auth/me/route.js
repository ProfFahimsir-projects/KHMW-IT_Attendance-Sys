import { getAuthUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Basic mode: return identity from the JWT without a DB round trip
    // (used by the dashboard layout for the header/sidebar)
    const { searchParams } = new URL(request.url);
    if (searchParams.get('basic') === '1') {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            role: authUser.role,
          },
        },
      });
    }

    await dbConnect();
    const user = await User.findById(authUser.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
