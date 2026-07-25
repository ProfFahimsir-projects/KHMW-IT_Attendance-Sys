import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Please provide class name (e.g., FY BSc IT)'],
      trim: true,
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    division: {
      type: String,
      default: 'A',
      trim: true,
    },
  },
  { timestamps: true }
);

ClassSchema.index({ className: 1, academicYearId: 1, division: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
