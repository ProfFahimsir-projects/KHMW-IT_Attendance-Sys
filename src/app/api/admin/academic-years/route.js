import dbConnect from '@/lib/db';
import AcademicYear from '@/models/AcademicYear';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const academicYears = await AcademicYear.find({}).sort({ yearLabel: -1 });
    return NextResponse.json({ success: true, data: { academicYears } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { yearLabel, startDate, endDate, isCurrent } = await request.json();

    if (!yearLabel || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Year label, start date, and end date are required' },
        { status: 400 }
      );
    }

    if (isCurrent) {
      // Mark all other years as false
      await AcademicYear.updateMany({}, { isCurrent: false });
    }

    const newYear = await AcademicYear.create({
      yearLabel,
      startDate,
      endDate,
      isCurrent: !!isCurrent,
    });

    return NextResponse.json({
      success: true,
      message: 'Academic Year added successfully',
      data: { academicYear: newYear },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
