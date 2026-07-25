import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const professors = await User.find({ role: 'PROFESSOR' }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: { professors } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, ['ADMIN']);
  if (errorResponse) return errorResponse;

  try {
    await dbConnect();
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Professor with this email already exists' },
        { status: 400 }
      );
    }

    const newProfessor = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'PROFESSOR',
      status: 'ACTIVE',
    });

    return NextResponse.json({
      success: true,
      message: 'Professor account created successfully',
      data: {
        professor: {
          id: newProfessor._id,
          name: newProfessor.name,
          email: newProfessor.email,
          phone: newProfessor.phone,
          status: newProfessor.status,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
