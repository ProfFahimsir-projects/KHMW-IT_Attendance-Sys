import dbConnect from '@/lib/db';
import SubjectAssignment from '@/models/SubjectAssignment';
import AcademicYear from '@/models/AcademicYear';
import User from '@/models/User';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const assignments = await SubjectAssignment.find({})
      .populate('professorId', 'name email status')
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('academicYearId', 'yearLabel isCurrent')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { assignments } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { professorId, classId, subjectId, academicYearId } = await request.json();

    if (!professorId || !classId || !subjectId) {
      return NextResponse.json(
        { success: false, message: 'Professor, class, and subject are required' },
        { status: 400 }
      );
    }

    let activeYearId = academicYearId;
    if (!activeYearId) {
      const currentYear = await AcademicYear.findOne({ isCurrent: true });
      if (!currentYear) {
        return NextResponse.json(
          { success: false, message: 'No active Academic Year configured' },
          { status: 400 }
        );
      }
      activeYearId = currentYear._id;
    }

    const assignment = await SubjectAssignment.create({
      professorId,
      classId,
      subjectId,
      academicYearId: activeYearId,
    });

    return NextResponse.json({
      success: true,
      message: 'Subject assigned to professor successfully',
      data: { assignment },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
