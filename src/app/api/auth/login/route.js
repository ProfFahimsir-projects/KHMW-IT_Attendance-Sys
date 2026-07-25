import dbConnect from '@/lib/db';
import User from '@/models/User';
import AcademicYear from '@/models/AcademicYear';
import Class from '@/models/Class';
import Subject from '@/models/Subject';
import Student from '@/models/Student';
import { signToken, setTokenCookie } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    // Auto-seed default Admin and initial structure if database has zero users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@khmw.edu.in';
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@KHMW2026!';
      
      const admin = await User.create({
        name: process.env.DEFAULT_ADMIN_NAME || 'KHMW Principal Admin',
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // Also create current Academic Year if missing
      let acYear = await AcademicYear.findOne({ yearLabel: '2025-2026' });
      if (!acYear) {
        acYear = await AcademicYear.create({
          yearLabel: '2025-2026',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2026-04-30'),
          isCurrent: true,
        });
      }

      // Seed default classes (FY BSc IT, SY BSc IT, TY BSc IT)
      const classNames = ['FY BSc IT', 'SY BSc IT', 'TY BSc IT'];
      for (const cName of classNames) {
        const existingClass = await Class.findOne({ className: cName, academicYearId: acYear._id });
        if (!existingClass) {
          const newClass = await Class.create({
            className: cName,
            division: 'A',
            academicYearId: acYear._id,
          });

          // Seed default subject for class
          const subCode = cName.startsWith('FY') ? 'BSCIT-101' : cName.startsWith('SY') ? 'BSCIT-301' : 'BSCIT-501';
          const subName = cName.startsWith('FY') ? 'Imperative Programming' : cName.startsWith('SY') ? 'Python Programming' : 'Software Engineering';
          const sub = await Subject.create({
            subjectCode: subCode,
            subjectName: subName,
            classId: newClass._id,
          });

          // Seed 3 sample students for instant demonstration
          for (let i = 1; i <= 3; i++) {
            const roll = `${cName.substring(0, 2)}202500${i}`;
            await Student.create({
              rollNumber: roll,
              studentName: `Student ${i} (${cName})`,
              contactNumber: `987654320${i}`,
              fatherContactNumber: `987654321${i}`,
              motherContactNumber: `987654322${i}`,
              classId: newClass._id,
              status: 'ACTIVE',
            });
          }
        }
      }
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. User not found.' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Please contact Admin.' },
        { status: 403 }
      );
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Incorrect password.' },
        { status: 401 }
      );
    }

    // Generate JWT payload
    const tokenData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await signToken(tokenData);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

    setTokenCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server authentication error' },
      { status: 500 }
    );
  }
}
