'use client';

import { useState, useEffect, useCallback } from 'react';
import StatCard from '@/components/common/StatCard';
import { BookOpen, School, ClipboardCheck, ArrowRight, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProfessorDashboardPage() {
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
        setError(data.message || 'Failed to load your assigned subjects.');
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Professor Workspace</h1>
          <p className="text-xs text-muted-foreground">Manage your daily lectures and record student attendance</p>
        </div>
        <Link
          href="/professor/take-attendance"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <ClipboardCheck className="h-4 w-4" />
          Take Attendance Now
        </Link>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Assigned Classes"
          value={loading ? '...' : assignments.length ? `${new Set(assignments.map(a => a.classId?._id)).size}` : '0'}
          subtitle="FY, SY, TY BSc IT"
          icon={School}
          colorGradient="from-blue-500/10 to-indigo-500/5"
        />
        <StatCard
          title="Assigned Subjects"
          value={loading ? '...' : `${assignments.length}`}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          colorGradient="from-purple-500/10 to-pink-500/5"
        />
        <StatCard
          title="Attendance Status"
          value="Ready"
          subtitle="Multi-lecture L1-L6 active"
          icon={ClipboardCheck}
          colorGradient="from-emerald-500/10 to-teal-500/5"
        />
      </div>

      {/* Assigned Classes & Subjects Cards */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Your Assigned Classes & Subjects</h2>
        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
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
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading your assigned subjects...</p>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No subjects assigned yet. Please contact Admin.</p>
            ) : (
              assignments.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {item.classId?.className}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      [{item.subjectId?.subjectCode}]
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-foreground">{item.subjectId?.subjectName}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Term: {item.academicYearId?.yearLabel}</p>

                  <div className="mt-4 border-t border-border/40 pt-3">
                    <Link
                      href={`/professor/take-attendance?classId=${item.classId?._id}&subjectId=${item.subjectId?._id}`}
                      className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Mark Lecture Attendance</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
