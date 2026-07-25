'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  User,
  Filter,
} from 'lucide-react';

export default function StudentAttendancePage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalClasses: 0, present: 0, absent: 0, late: 0, percentage: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const months = [
    { value: '', label: 'All Months' },
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-03', label: 'March 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-05', label: 'May 2025' },
    { value: '2025-06', label: 'June 2025' },
    { value: '2025-07', label: 'July 2025' },
    { value: '2025-08', label: 'August 2025' },
    { value: '2025-09', label: 'September 2025' },
    { value: '2025-10', label: 'October 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-12', label: 'December 2025' },
    { value: '2026-01', label: 'January 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-05', label: 'May 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-08', label: 'August 2026' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-10', label: 'October 2026' },
    { value: '2026-11', label: 'November 2026' },
    { value: '2026-12', label: 'December 2026' },
  ];

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/students/${id}/attendance?`;
      if (selectedMonth) url += `month=${selectedMonth}&`;
      if (selectedSubject) url += `subjectId=${selectedSubject}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudent(data.data.student);
        setRecords(data.data.records);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
    setLoading(false);
  };

  const fetchSubjects = async () => {
    try {
      const classId = student?.classId?._id;
      if (!classId) return;
      const res = await fetch(`/api/admin/subjects?classId=${classId}`);
      const data = await res.json();
      if (data.success) setSubjects(data.data.subjects);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSubjects();
  }, [student]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedSubject]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'Late':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'Absent':
        return <XCircle className="h-3.5 w-3.5" />;
      case 'Late':
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const subjectWiseStats = {};
  for (const rec of records) {
    const subName = rec.subject?.subjectName || 'Unknown';
    if (!subjectWiseStats[subName]) {
      subjectWiseStats[subName] = { total: 0, present: 0, absent: 0, late: 0 };
    }
    subjectWiseStats[subName].total++;
    if (rec.status === 'Present') subjectWiseStats[subName].present++;
    else if (rec.status === 'Absent') subjectWiseStats[subName].absent++;
    else if (rec.status === 'Late') subjectWiseStats[subName].late++;
  }

  if (loading && !student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-xl border border-border bg-muted/40 p-2 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Student Attendance</h1>
            <p className="text-xs text-muted-foreground">Loading student data...</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-8 text-center text-muted-foreground shadow-sm">
          Loading attendance records...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-border bg-muted/40 p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Student Attendance</h1>
            <p className="text-xs text-muted-foreground">
              Complete attendance history with month &amp; subject filters
            </p>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      {student && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{student.studentName}</h2>
              <p className="text-xs text-muted-foreground">
                Roll No. <span className="font-mono font-semibold text-primary">{student.rollNumber}</span>
                {' '}&middot;{' '}
                {student.classId?.className || 'N/A'}
                {student.classId?.division ? ` - ${student.classId.division}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Contact: <span className="font-mono font-semibold text-foreground">{student.contactNumber}</span></span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Total Classes</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.totalClasses}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Present</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.present}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Absent</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Late</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.late}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Attendance %</p>
          <p className="mt-1 text-2xl font-bold text-primary">{stats.percentage}%</p>
        </div>
      </div>

      {/* Subject-wise Breakdown */}
      {Object.keys(subjectWiseStats).length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">Subject-wise Breakdown</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(subjectWiseStats).map(([subName, s]) => {
              const pct = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
              return (
                <div key={subName} className="rounded-xl border border-border/40 bg-muted/20 p-3">
                  <p className="text-xs font-bold text-foreground">{subName}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Total: <span className="font-semibold text-foreground">{s.total}</span></span>
                    <span className="text-emerald-600">P: {s.present}</span>
                    <span className="text-red-600">A: {s.absent}</span>
                    <span className="text-amber-600">L: {s.late}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/40 px-5 py-3">
          <h3 className="text-sm font-bold text-foreground">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Lecture</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-muted-foreground">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-muted-foreground">
                    No attendance records found for the selected filters.
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr key={rec._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">{formatDate(rec.date)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {rec.lectureNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <span className="font-semibold text-foreground">{rec.subject?.subjectName || 'N/A'}</span>
                      <span className="ml-1 text-[10px]">({rec.subject?.subjectCode || ''})</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(rec.status)}`}>
                        {getStatusIcon(rec.status)}
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
