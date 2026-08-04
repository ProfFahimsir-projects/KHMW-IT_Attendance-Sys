'use client';

import { useState, useEffect, useCallback } from 'react';
import { School, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProfessorAssignedClassesPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/professor/assigned');
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.assignments)) {
        setAssignments(data.data.assignments);
      } else {
        setAssignments([]);
        setError(data.message || 'Failed to load assigned classes.');
      }
    } catch (err) {
      setAssignments([]);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

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
        ) : error ? (
          <div className="col-span-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="mt-2 text-xs font-semibold text-foreground">{error}</p>
            <button
              onClick={fetchAssignments}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
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
