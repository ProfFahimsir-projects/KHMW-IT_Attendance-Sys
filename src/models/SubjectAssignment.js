import mongoose from 'mongoose';

const SubjectAssignmentSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  },
  { timestamps: true }
);

SubjectAssignmentSchema.index(
  { professorId: 1, classId: 1, subjectId: 1, academicYearId: 1 },
  { unique: true }
);

export default mongoose.models.SubjectAssignment || mongoose.model('SubjectAssignment', SubjectAssignmentSchema);
