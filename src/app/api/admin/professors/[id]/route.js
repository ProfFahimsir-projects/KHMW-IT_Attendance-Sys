import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { id } = params;
    const { name, phone, status, password } = await request.json();

    const professor = await User.findById(id);
    if (!professor || professor.role !== 'PROFESSOR') {
      return NextResponse.json({ success: false, message: 'Professor not found' }, { status: 404 });
    }

    if (name) professor.name = name;
    if (phone !== undefined) professor.phone = phone;
    if (status) professor.status = status;
    if (password) professor.password = password; // Will trigger pre('save') hash

    await professor.save();

    return NextResponse.json({
      success: true,
      message: 'Professor updated successfully',
      data: { professor },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
