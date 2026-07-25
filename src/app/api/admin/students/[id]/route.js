import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { id } = params;
    const updateData = await request.json();

    const student = await Student.findByIdAndUpdate(id, updateData, { new: true });
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: { student },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { id } = params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
