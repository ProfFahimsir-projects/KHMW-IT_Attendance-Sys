import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  const { user, errorResponse } = await requireAuth(request, ['PROFESSOR']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { name, phone, currentPassword, newPassword } = await request.json();

    const professor = await User.findById(user.id).select('+password');
    if (!professor) {
      return NextResponse.json({ success: false, message: 'Professor not found' }, { status: 404 });
    }

    if (name) professor.name = name;
    if (phone !== undefined) professor.phone = phone;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }
      const isMatch = await professor.matchPassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      professor.password = newPassword;
    }

    await professor.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: { professor: { _id: professor._id, name: professor.name, email: professor.email, phone: professor.phone } },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
