'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

export default function ProfessorAssignedSubjectsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/professor/assigned')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAssignments(data.data.assignments);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Assigned Subjects</h1>
        <p className="text-xs text-muted-foreground">Curriculum subjects mapped to your teaching profile</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-3.5">Subject Code</th>
              <th className="px-6 py-3.5">Subject Title</th>
              <th className="px-6 py-3.5">Class</th>
              <th className="px-6 py-3.5">Academic Term</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                  Loading assigned subjects...
                </td>
              </tr>
            ) : assignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                  No subjects assigned.
                </td>
              </tr>
            ) : (
              assignments.map((item) => (
                <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary">
                    {item.subjectId?.subjectCode}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {item.subjectId?.subjectName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.classId?.className}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.academicYearId?.yearLabel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
