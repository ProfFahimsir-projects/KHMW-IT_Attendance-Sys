import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: [true, 'Please provide roll number'],
      trim: true,
    },
    studentName: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide contact number'],
      trim: true,
    },
    fatherContactNumber: {
      type: String,
      required: [true, 'Please provide father contact number'],
      trim: true,
    },
    motherContactNumber: {
      type: String,
      required: [true, 'Please provide mother contact number'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

StudentSchema.index({ rollNumber: 1, classId: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
