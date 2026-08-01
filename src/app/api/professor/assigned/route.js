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

    let query = { professorId: user.id };

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

    const [activeYear, allAssignments] = await Promise.all([
      AcademicYear.findOne({ isCurrent: true }).select('_id').lean(),
      SubjectAssignment.find(query)
        .populate('classId', 'className division')
        .populate('subjectId', 'subjectCode subjectName')
        .populate('academicYearId', 'yearLabel isCurrent')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Scope to the active academic year in memory (data is small) to save a round trip
    const assignments = activeYear
      ? allAssignments.filter((a) => {
          const yearId = a.academicYearId?._id || a.academicYearId;
          return yearId ? yearId.toString() === activeYear._id.toString() : false;
        })
      : allAssignments;

    return NextResponse.json({
      success: true,
      data: { assignments },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
