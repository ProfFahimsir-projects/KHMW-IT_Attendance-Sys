import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import AcademicYear from '@/models/AcademicYear';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { user, errorResponse } = await requireAuth(request, ['PROFESSOR', 'ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { date, lectureNumber, classId, subjectId, records } = await request.json();

    if (!date || !lectureNumber || !classId || !subjectId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { success: false, message: 'Date, Lecture Number, Class, Subject, and Student Records are required.' },
        { status: 400 }
      );
    }

    // Normalize date to YYYY-MM-DD midnight UTC
    const dateObj = new Date(date);
    dateObj.setUTCHours(0, 0, 0, 0);

    // Fetch active academic year
    const activeYear = await AcademicYear.findOne({ isCurrent: true });
    if (!activeYear) {
      return NextResponse.json(
        { success: false, message: 'No active Academic Year found in system settings.' },
        { status: 400 }
      );
    }

    // Check if attendance for this specific lecture on this date already exists
    const existingAttendance = await Attendance.findOne({
      date: dateObj,
      classId,
      subjectId,
      lectureNumber,
      academicYearId: activeYear._id,
    });

    if (existingAttendance) {
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            message: `Attendance for ${lectureNumber} on this date has already been submitted and locked. Only an Admin can edit submitted history.`,
          },
          { status: 409 }
        );
      } else {
        // Admin overwrites existing session
        existingAttendance.records = records;
        existingAttendance.markedByProfessorId = user.id;
        await existingAttendance.save();

        return NextResponse.json({
          success: true,
          message: `Attendance for ${lectureNumber} updated successfully by Admin.`,
          data: { attendance: existingAttendance },
        });
      }
    }

    // Create new lecture attendance entry
    const newAttendance = await Attendance.create({
      date: dateObj,
      lectureNumber,
      classId,
      subjectId,
      academicYearId: activeYear._id,
      markedByProfessorId: user.id,
      records,
    });

    return NextResponse.json({
      success: true,
      message: `Attendance for ${lectureNumber} submitted successfully!`,
      data: { attendance: newAttendance },
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
