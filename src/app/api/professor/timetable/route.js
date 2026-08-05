import dbConnect from '@/lib/db';
import Timetable from '@/models/Timetable';
import AcademicYear from '@/models/AcademicYear';
import SubjectAssignment from '@/models/SubjectAssignment';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { user, errorResponse } = await requireAuth(request, ['PROFESSOR', 'ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode') || 'personal'; // 'personal' or 'class'
    const classId = searchParams.get('classId');

    const activeYear = await AcademicYear.findOne({ isCurrent: true }).select('_id').lean();
    const activeYearId = activeYear?._id;

    let query = {};
    if (activeYearId) {
      query.academicYearId = activeYearId;
    }

    if (viewMode === 'personal') {
      // Fetch logged-in professor's timetable
      query.professorId = user.id;
    } else if (viewMode === 'class' && classId) {
      // Fetch timetable for selected class
      query.classId = classId;
    }

    const timetable = await Timetable.find(query)
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('professorId', 'name email phone')
      .populate('academicYearId', 'yearLabel isCurrent')
      .sort({ day: 1, lectureNumber: 1 });

    // Also fetch professor's assigned classes so the dropdown options are available in professor portal
    const userAssignments = await SubjectAssignment.find({
      professorId: user.id,
      ...(activeYearId ? { academicYearId: activeYearId } : {}),
    })
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .lean();

    const assignedClassesMap = new Map();
    userAssignments.forEach((a) => {
      if (a.classId?._id) {
        assignedClassesMap.set(a.classId._id.toString(), a.classId);
      }
    });
    const assignedClasses = Array.from(assignedClassesMap.values());

    return NextResponse.json({
      success: true,
      data: {
        timetable,
        assignedClasses,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
