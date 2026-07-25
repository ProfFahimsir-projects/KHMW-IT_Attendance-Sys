import dbConnect from '@/lib/db';
import SubjectAssignment from '@/models/SubjectAssignment';
import AcademicYear from '@/models/AcademicYear';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { user, errorResponse } = await requireAuth(request, ['PROFESSOR', 'ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    
    // Find current active academic year
    const activeYear = await AcademicYear.findOne({ isCurrent: true });

    let query = { professorId: user.id };
    if (activeYear) {
      query.academicYearId = activeYear._id;
    }

    // If ADMIN, option to view all assignments
    if (user.role === 'ADMIN') {
      const { searchParams } = new URL(request.url);
      const profIdParam = searchParams.get('professorId');
      if (profIdParam) {
        query.professorId = profIdParam;
      } else {
        delete query.professorId;
      }
    }

    const assignments = await SubjectAssignment.find(query)
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('academicYearId', 'yearLabel isCurrent')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: { assignments },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
