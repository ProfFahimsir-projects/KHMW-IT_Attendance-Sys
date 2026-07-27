'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LECTURE_NUMBERS } from '@/lib/constants';
import { ClipboardCheck, CheckCircle2, Clock, XCircle, Users, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function TakeAttendanceContent() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get('classId') || '';
  const initialSubjectId = searchParams.get('subjectId') || '';

  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lectureNumber, setLectureNumber] = useState('Lecture 1');

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { studentId: 'Present' | 'Absent' | 'Late' }
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch assigned classes & subjects for professor
  useEffect(() => {
    fetch('/api/professor/assigned')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAssignments(data.data.assignments);
      });
  }, []);

  // When class changes, fetch roster
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setRecords({});
      return;
    }

    setLoading(true);
    fetch(`/api/professor/students?classId=${selectedClassId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.data.students);

          // ATTENDANCE RULE: Initially every student is marked Absent
          const initialMap = {};
          data.data.students.forEach((s) => {
            initialMap[s._id] = 'Absent';
          });
          setRecords(initialMap);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedClassId]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = 'Present';
    });
    setRecords(updated);
    toast.info('Marked all students Present');
  };

  const handleClearAllAbsent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = 'Absent';
    });
    setRecords(updated);
    toast.info('Reset all students to Absent');
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId || !date || !lectureNumber) {
      toast.error('Please select Class, Subject, Date, and Lecture Number.');
      return;
    }

    if (students.length === 0) {
      toast.error('No students found in selected class roster.');
      return;
    }

    const payloadRecords = students.map((s) => ({
      studentId: s._id,
      status: records[s._id] || 'Absent',
    }));

    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          lectureNumber,
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          records: payloadRecords,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Submission failed');
        return;
      }

      toast.success(data.message || 'Attendance submitted successfully!');
    } catch (err) {
      setSubmitting(false);
      toast.error('Error submitting attendance');
    }
  };

  // Derive summary metrics
  const totalCount = students.length;
  const presentCount = Object.values(records).filter((s) => s === 'Present').length;
  const lateCount = Object.values(records).filter((s) => s === 'Late').length;
  const absentCount = Object.values(records).filter((s) => s === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Take Lecture Attendance
        </h1>
        <p className="text-xs text-muted-foreground">
          Multi-lecture support (L1-L6) • Students default to Absent per institutional policy
        </p>
      </div>

      {/* Selector Toolbar */}
      <form onSubmit={handleSubmitAttendance} className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Select Class */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedSubjectId('');
                }}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
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
            </div>

            {/* Select Subject */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Select Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
                disabled={!selectedClassId}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs disabled:opacity-50"
              >
                <option value="">-- Choose Subject --</option>
                {assignments
                  .filter((a) => a.classId?._id === selectedClassId)
                  .map((a) => (
                    <option key={a.subjectId?._id} value={a.subjectId?._id}>
                      [{a.subjectId?.subjectCode}] {a.subjectId?.subjectName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Select Date */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            {/* Select Lecture Slot (L1 - L6) */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Lecture Number</label>
              <select
                value={lectureNumber}
                onChange={(e) => setLectureNumber(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-primary"
              >
                {LECTURE_NUMBERS.map((lec) => (
                  <option key={lec} value={lec}>
                    {lec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Counter & Batch Actions Bar */}
        {selectedClassId && students.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-foreground">Total: {totalCount}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Present: {presentCount}
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Late: {lateCount}
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                Absent: {absentCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={handleClearAllAbsent}
                className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Reset All to Absent
              </button>
            </div>
          </div>
        )}

        {/* Student Roster Marking Matrix */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading class roster...
            </div>
          ) : !selectedClassId ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Please select a class and subject above to load the student attendance sheet.
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No active students enrolled in this class roster.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {students.map((student) => {
                const currentStatus = records[student._id] || 'Absent';

                return (
                  <div
                    key={student._id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-primary min-w-[70px]">
                        {student.rollNumber}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{student.studentName}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Ph: {student.contactNumber}
                        </p>
                      </div>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Present Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'Present')}
                        className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'border border-border bg-muted/30 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Present
                      </button>

                      {/* Late Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'Late')}
                        className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                          currentStatus === 'Late'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                            : 'border border-border bg-muted/30 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Late
                      </button>

                      {/* Absent Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student._id, 'Absent')}
                        className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                          currentStatus === 'Absent'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : 'border border-border bg-muted/30 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Attendance Sheet CTA */}
        {selectedClassId && students.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <ClipboardCheck className="h-4 w-4" />
              {submitting ? 'Locking Attendance...' : `Submit ${lectureNumber} Attendance`}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function TakeAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Loading attendance sheet...
        </div>
      }
    >
      <TakeAttendanceContent />
    </Suspense>
  );
}