import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Class from '@/models/Class';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let query = {};
    if (classId) {
      query.classId = classId;
    }

    const subjects = await Subject.find(query).populate('classId').sort({ subjectCode: 1 });
    return NextResponse.json({ success: true, data: { subjects } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { subjectCode, subjectName, classId } = await request.json();

    if (!subjectCode || !subjectName || !classId) {
      return NextResponse.json(
        { success: false, message: 'Subject code, subject name, and class are required' },
        { status: 400 }
      );
    }

    const newSubject = await Subject.create({
      subjectCode,
      subjectName,
      classId,
    });

    return NextResponse.json({
      success: true,
      message: 'Subject added successfully',
      data: { subject: newSubject },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
