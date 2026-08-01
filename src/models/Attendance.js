import mongoose from 'mongoose';

const AttendanceRecordItemSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: true,
      default: 'Absent',
    },
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    lectureNumber: {
      type: String,
      enum: ['Lecture 1', 'Lecture 2', 'Lecture 3', 'Lecture 4', 'Lecture 5', 'Lecture 6'],
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    markedByProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    records: [AttendanceRecordItemSchema],
  },
  { timestamps: true }
);

// Compound index to guarantee that attendance for a specific lecture on a specific date is unique
AttendanceSchema.index(
  { date: 1, classId: 1, subjectId: 1, lectureNumber: 1, academicYearId: 1 },
  { unique: true }
);

// Support class-level queries (attendance management, analytics) without a date filter
AttendanceSchema.index({ classId: 1, date: -1 });

// Support per-student attendance lookups in a single query
AttendanceSchema.index({ 'records.studentId': 1 });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
