import dbConnect from '@/lib/db';
import Student from '@/models/Student';
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

    const students = await Student.find(query).populate('classId');
    students.sort((a, b) => {
      const numA = parseInt(a.rollNumber, 10);
      const numB = parseInt(b.rollNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });
    return NextResponse.json({ success: true, data: { students } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { rollNumber, studentName, contactNumber, fatherContactNumber, motherContactNumber, classId } = await request.json();

    if (!rollNumber || !studentName || !contactNumber || !classId) {
      return NextResponse.json(
        { success: false, message: 'All fields (Roll Number, Name, Contact, Class) are required.' },
        { status: 400 }
      );
    }

    const existingStudent = await Student.findOne({ rollNumber, classId });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: `Student with Roll Number ${rollNumber} already exists in this class.` },
        { status: 400 }
      );
    }

    const student = await Student.create({
      rollNumber,
      studentName,
      contactNumber,
      fatherContactNumber,
      motherContactNumber,
      classId,
      status: 'ACTIVE',
    });

    return NextResponse.json({
      success: true,
      message: 'Student added successfully',
      data: { student },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
