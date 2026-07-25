import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { attendanceId, records } = await request.json();

    if (!attendanceId || !records) {
      return NextResponse.json(
        { success: false, message: 'Attendance ID and Records are required' },
        { status: 400 }
      );
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return NextResponse.json({ success: false, message: 'Attendance session not found' }, { status: 404 });
    }

    attendance.records = records;
    await attendance.save();

    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully by Admin',
      data: { attendance },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
