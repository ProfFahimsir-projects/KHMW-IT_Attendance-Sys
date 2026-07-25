import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const subjectId = searchParams.get('subjectId');

    const student = await Student.findById(id).populate('classId', 'className division');
    if (!student) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    let query = { classId: student.classId._id };
    if (subjectId) query.subjectId = subjectId;

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const start = new Date(Date.UTC(year, mon - 1, 1));
      const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const attendances = await Attendance.find(query)
      .populate('subjectId', 'subjectCode subjectName')
      .sort({ date: -1, lectureNumber: 1 });

    const records = [];
    for (const att of attendances) {
      const rec = att.records.find(
        (r) => r.studentId.toString() === id
      );
      if (rec) {
        records.push({
          _id: att._id,
          date: att.date,
          lectureNumber: att.lectureNumber,
          subject: att.subjectId,
          status: rec.status,
        });
      }
    }

    let totalClasses = records.length;
    let present = records.filter((r) => r.status === 'Present').length;
    let absent = records.filter((r) => r.status === 'Absent').length;
    let late = records.filter((r) => r.status === 'Late').length;
    let percentage = totalClasses > 0 ? Math.round(((present + late) / totalClasses) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        student,
        records,
        stats: { totalClasses, present, absent, late, percentage },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
