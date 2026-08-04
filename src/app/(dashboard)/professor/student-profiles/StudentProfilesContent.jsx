'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Lock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StudentProfilesContent() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get('classId') || '';

  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/professor/assigned');
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.assignments)) {
        setAssignments(data.data.assignments);
        setSelectedClassId((prev) => {
          if (prev) return prev;
          return data.data.assignments[0]?.classId?._id || '';
        });
        setError(null);
      } else {
        setError(data.message || 'Failed to load assigned classes.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const fetchStudents = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/professor/students?classId=${selectedClassId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.students)) {
        setStudents(data.data.students);
      } else {
        setStudents([]);
        setError(data.message || 'Failed to load student roster.');
      }
    } catch (err) {
      setStudents([]);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students
    .filter(
      (s) =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const numA = parseInt(a.rollNumber, 10);
      const numB = parseInt(b.rollNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.rollNumber.localeCompare(b.rollNumber);
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Student Roster Directory</h1>
        <p className="text-xs text-muted-foreground">Read-only view of enrolled student contact details</p>
      </div>

      {/* Class Selector & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by roll number or student name..."
            className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium"
        >
          <option value="">-- Choose Class --</option>
          {Array.from(new Set(assignments.map((a) => a.classId?._id))).map((cId) => {
            const assignment = assignments.find((a) => a.classId?._id === cId);
            if (!assignment) return null;
            return (
              <option key={cId} value={cId}>
                {assignment.classId?.className}
              </option>
            );
          })}
        </select>
        <span className="whitespace-nowrap rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
          {loading ? '...' : `${filteredStudents.length} Student${filteredStudents.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Read-Only Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {error && (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-xs font-semibold text-foreground">{error}</p>
            <button
              onClick={() => (selectedClassId ? fetchStudents() : fetchAssignments())}
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}
        {!error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3.5">Roll No.</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Student Contact</th>
                <th className="px-6 py-3.5">Father Contact</th>
                <th className="px-6 py-3.5">Mother Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    Loading student roster...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{std.rollNumber}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{std.studentName}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <a href={`tel:${std.contactNumber}`} className="hover:text-primary underline">
                        {std.contactNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <a href={`tel:${std.fatherContactNumber}`} className="hover:text-primary underline">
                        {std.fatherContactNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <a href={`tel:${std.motherContactNumber}`} className="hover:text-primary underline">
                        {std.motherContactNumber}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>Student profile editing and modifications are restricted to Admin.</span>
      </div>
    </div>
  );
}
