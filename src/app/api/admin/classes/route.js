import dbConnect from '@/lib/db';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
import AcademicYear from '@/models/AcademicYear';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get('academicYearId');

    let query = {};
    if (academicYearId) {
      query.academicYearId = academicYearId;
    } else {
      const currentYear = await AcademicYear.findOne({ isCurrent: true });
      if (currentYear) {
        query.academicYearId = currentYear._id;
      }
    }

    const classes = await Class.find(query).populate('academicYearId').sort({ className: 1 });

    const classIds = classes.map((c) => c._id);
    const subjects = await Subject.find({ classId: { $in: classIds } }).sort({ subjectCode: 1 });
    const subjectsByClass = {};
    for (const s of subjects) {
      const key = s.classId.toString();
      if (!subjectsByClass[key]) subjectsByClass[key] = [];
      subjectsByClass[key].push(s);
    }

    const classesWithSubjects = classes.map((c) => ({
      ...c.toObject(),
      subjects: subjectsByClass[c._id.toString()] || [],
    }));

    return NextResponse.json({ success: true, data: { classes: classesWithSubjects } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { className, division, academicYearId } = await request.json();

    if (!className || !academicYearId) {
      return NextResponse.json(
        { success: false, message: 'Class Name and Academic Year are required' },
        { status: 400 }
      );
    }

    const newClass = await Class.create({
      className,
      division: division || 'A',
      academicYearId,
    });

    return NextResponse.json({
      success: true,
      message: 'Class added successfully',
      data: { class: newClass },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
