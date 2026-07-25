import mongoose from 'mongoose';

const AcademicYearSchema = new mongoose.Schema(
  {
    yearLabel: {
      type: String,
      required: [true, 'Please provide academic year label (e.g. 2025-2026)'],
      unique: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AcademicYear || mongoose.model('AcademicYear', AcademicYearSchema);
