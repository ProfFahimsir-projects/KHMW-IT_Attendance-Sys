import dbConnect from '@/lib/db';
import Timetable from '@/models/Timetable';
import AcademicYear from '@/models/AcademicYear';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN', 'PROFESSOR']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const professorId = searchParams.get('professorId');
    const day = searchParams.get('day');
    const academicYearIdParam = searchParams.get('academicYearId');

    let query = {};
    if (classId) query.classId = classId;
    if (professorId) query.professorId = professorId;
    if (day) query.day = day;

    if (academicYearIdParam) {
      query.academicYearId = academicYearIdParam;
    } else {
      const activeYear = await AcademicYear.findOne({ isCurrent: true }).select('_id').lean();
      if (activeYear) query.academicYearId = activeYear._id;
    }

    const timetable = await Timetable.find(query)
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('professorId', 'name email phone')
      .populate('academicYearId', 'yearLabel isCurrent')
      .sort({ day: 1, lectureNumber: 1 });

    return NextResponse.json({
      success: true,
      data: { timetable },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const {
      classId,
      subjectId,
      professorId,
      day,
      lectureNumber,
      startTime,
      endTime,
      roomNumber,
      academicYearId,
    } = await request.json();

    if (!classId || !subjectId || !professorId || !day || !lectureNumber || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: 'Class, Subject, Professor, Day, Lecture Number, Start Time, and End Time are required.',
        },
        { status: 400 }
      );
    }

    let targetYearId = academicYearId;
    if (!targetYearId) {
      const activeYear = await AcademicYear.findOne({ isCurrent: true });
      if (!activeYear) {
        return NextResponse.json(
          { success: false, message: 'No active Academic Year found.' },
          { status: 400 }
        );
      }
      targetYearId = activeYear._id;
    }

    // Check Class Collision
    const existingClassSlot = await Timetable.findOne({
      classId,
      day,
      lectureNumber,
      academicYearId: targetYearId,
    }).populate('subjectId', 'subjectName');

    if (existingClassSlot) {
      return NextResponse.json(
        {
          success: false,
          message: `Class conflict: This class already has ${existingClassSlot.subjectId?.subjectName || 'a lecture'} scheduled for ${lectureNumber} on ${day}.`,
        },
        { status: 409 }
      );
    }

    // Check Professor Collision
    const existingProfSlot = await Timetable.findOne({
      professorId,
      day,
      lectureNumber,
      academicYearId: targetYearId,
    }).populate('classId', 'className');

    if (existingProfSlot) {
      return NextResponse.json(
        {
          success: false,
          message: `Professor conflict: This professor is already assigned to ${existingProfSlot.classId?.className} for ${lectureNumber} on ${day}.`,
        },
        { status: 409 }
      );
    }

    const newEntry = await Timetable.create({
      classId,
      subjectId,
      professorId,
      day,
      lectureNumber,
      startTime,
      endTime,
      roomNumber: roomNumber || '',
      academicYearId: targetYearId,
    });

    const populatedEntry = await Timetable.findById(newEntry._id)
      .populate('classId', 'className division')
      .populate('subjectId', 'subjectCode subjectName')
      .populate('professorId', 'name email')
      .populate('academicYearId', 'yearLabel');

    return NextResponse.json({
      success: true,
      message: 'Timetable entry created successfully!',
      data: { timetable: populatedEntry },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Timetable ID is required' }, { status: 400 });
    }

    const deleted = await Timetable.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Timetable entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Timetable slot deleted successfully!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
