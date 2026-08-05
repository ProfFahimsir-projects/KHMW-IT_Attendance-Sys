import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Please provide class'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please provide subject'],
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide professor'],
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Please provide academic year'],
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: [true, 'Please select day'],
    },
    lectureNumber: {
      type: String,
      enum: ['Lecture 1', 'Lecture 2', 'Lecture 3', 'Lecture 4', 'Lecture 5', 'Lecture 6'],
      required: [true, 'Please select lecture number'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (e.g. 07:30 AM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (e.g. 08:20 AM)'],
      trim: true,
    },
    roomNumber: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure no double booking for class at same day & lecture slot
TimetableSchema.index(
  { classId: 1, day: 1, lectureNumber: 1, academicYearId: 1 },
  { unique: true }
);

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
