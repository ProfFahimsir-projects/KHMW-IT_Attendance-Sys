import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ['PROFESSOR', 'ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'classId query parameter is required' },
        { status: 400 }
      );
    }

    const students = await Student.find({ classId, status: 'ACTIVE' });
    students.sort((a, b) => {
      const numA = parseInt(a.rollNumber, 10);
      const numB = parseInt(b.rollNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });
    return NextResponse.json({
      success: true,
      data: { students },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
