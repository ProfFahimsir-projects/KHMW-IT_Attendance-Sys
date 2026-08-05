import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import SubjectAssignment from '@/models/SubjectAssignment';
import Timetable from '@/models/Timetable';
import Attendance from '@/models/Attendance';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { id } = params;
    const { subjectCode, subjectName, classId } = await request.json();

    if (!subjectCode || !subjectName || !classId) {
      return NextResponse.json(
        { success: false, message: 'Subject code, subject name, and class are required' },
        { status: 400 }
      );
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }

    subject.subjectCode = subjectCode;
    subject.subjectName = subjectName;
    subject.classId = classId;

    await subject.save();

    return NextResponse.json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject },
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

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject not found' }, { status: 404 });
    }

    await SubjectAssignment.deleteMany({ subjectId: id });
    await Timetable.deleteMany({ subjectId: id });
    await Attendance.deleteMany({ subjectId: id });

    return NextResponse.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
