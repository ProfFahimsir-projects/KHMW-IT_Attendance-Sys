import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ['PROFESSOR', 'ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const date = searchParams.get('date');
    const lectureNumber = searchParams.get('lectureNumber');

    let query = {};
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (lectureNumber) query.lectureNumber = lectureNumber;
    if (date) {
      const dateObj = new Date(date);
      dateObj.setUTCHours(0, 0, 0, 0);
      query.date = dateObj;
    }

    const attendances = await Attendance.find(query)
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('markedByProfessorId', 'name email')
      .populate('records.studentId', 'rollNumber studentName contactNumber fatherContactNumber motherContactNumber')
      .sort({ date: -1, lectureNumber: 1 });

    return NextResponse.json({
      success: true,
      data: { attendances },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
