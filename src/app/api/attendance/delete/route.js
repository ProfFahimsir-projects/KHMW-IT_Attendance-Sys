import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Attendance ID is required' }, { status: 400 });
    }

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return NextResponse.json({ success: false, message: 'Attendance record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully by Admin',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
