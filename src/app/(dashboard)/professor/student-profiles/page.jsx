import { Suspense } from 'react';
import StudentProfilesContent from './StudentProfilesContent';

export default function ProfessorStudentProfilesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-muted-foreground">Loading student profiles...</div>}>
      <StudentProfilesContent />
    </Suspense>
  );
}
