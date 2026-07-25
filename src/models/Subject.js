import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Please provide subject code'],
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
  },
  { timestamps: true }
);

SubjectSchema.index({ subjectCode: 1, classId: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
