'use client';

import { useState, useEffect } from 'react';
import { School, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfessorAssignedClassesPage() {
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

  const uniqueClasses = Array.from(
    new Map(assignments.map((a) => [a.classId?._id, a.classId])).values()
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Assigned Classes</h1>
        <p className="text-xs text-muted-foreground">Classes allocated to you for the current academic session</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading assigned classes...</p>
        ) : uniqueClasses.length === 0 ? (
          <p className="text-xs text-muted-foreground">No classes assigned to your profile.</p>
        ) : (
          uniqueClasses.map((cls) => (
            <div key={cls._id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                <School className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-bold text-foreground">{cls.className}</h3>
              <p className="text-xs text-muted-foreground">Division {cls.division || 'A'}</p>

              <div className="mt-4 border-t border-border/40 pt-3">
                <Link
                  href={`/professor/student-profiles?classId=${cls._id}`}
                  className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
                >
                  <span>View Student Roster</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
