'use client';

import { useState, useEffect } from 'react';
import { ClipboardCheck, Trash2, Edit3, Search, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAttendanceManagementPage() {
  const [attendances, setAttendances] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [editingAttendance, setEditingAttendance] = useState(null);
  const [editRecords, setEditRecords] = useState([]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      if (data.success) setClasses(data.data.classes);
    } catch (err) {}
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = '/api/attendance/view?';
      if (selectedClassId) url += `classId=${selectedClassId}&`;
      if (selectedDate) url += `date=${selectedDate}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAttendances(data.data.attendances);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAttendance();
  }, [selectedClassId, selectedDate]);

  const handleDeleteSession = async (id) => {
    if (!confirm('Are you sure you want to delete this lecture attendance session?')) return;
    try {
      const res = await fetch(`/api/attendance/delete?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Attendance session deleted by Admin');
        fetchAttendance();
      } else {
        toast.error(data.message || 'Failed to delete session');
      }
    } catch (err) {
      toast.error('Error deleting session');
    }
  };

  const handleStartEdit = (att) => {
    setEditingAttendance(att);
    setEditRecords(att.records.map(r => ({
      studentId: r.studentId?._id || r.studentId,
      studentName: r.studentId?.studentName || 'Student',
      rollNumber: r.studentId?.rollNumber || '',
      status: r.status,
    })));
  };

  const handleStatusToggle = (index, newStatus) => {
    const updated = [...editRecords];
    updated[index].status = newStatus;
    setEditRecords(updated);
  };

  const handleSaveEdit = async () => {
    if (!editingAttendance) return;
    try {
      const res = await fetch('/api/attendance/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: editingAttendance._id,
          records: editRecords.map(r => ({ studentId: r.studentId, status: r.status })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Attendance record updated successfully by Admin');
        setEditingAttendance(null);
        fetchAttendance();
      } else {
        toast.error(data.message || 'Failed to update record');
      }
    } catch (err) {
      toast.error('Error saving edits');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Attendance Audit & Management</h1>
          <p className="text-xs text-muted-foreground">Admin privileges to edit or delete historical lecture attendance</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Class Filter</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Date Filter</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Attendance Session List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-xs text-muted-foreground py-8">Loading attendance records...</p>
        ) : attendances.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">No attendance sessions found for selected filters.</p>
        ) : (
          attendances.map((att) => {
            const total = att.records.length;
            const present = att.records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <div
                key={att._id}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {att.lectureNumber}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">
                        {att.classId?.className} • {att.subjectId?.subjectName}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Conducted by: Prof. {att.markedByProfessorId?.name || 'Unknown'} on{' '}
                      {new Date(att.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">
                        {present} / {total} Present
                      </p>
                      <p className={`text-[10px] font-semibold ${pct >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {pct}% Attendance Rate
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(att)}
                        className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Sheet
                      </button>
                      <button
                        onClick={() => handleDeleteSession(att._id)}
                        className="flex items-center gap-1 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Attendance Sheet Modal */}
      {editingAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">
              Admin Edit Sheet: {editingAttendance.lectureNumber} ({editingAttendance.classId?.className})
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Date: {new Date(editingAttendance.date).toLocaleDateString('en-IN')} • Subject: {editingAttendance.subjectId?.subjectName}
            </p>

            <div className="max-h-96 overflow-y-auto divide-y divide-border/40 pr-2">
              {editRecords.map((r, idx) => (
                <div key={r.studentId} className="flex items-center justify-between py-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary mr-2">{r.rollNumber}</span>
                    <span className="text-xs font-semibold text-foreground">{r.studentName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {['Present', 'Late', 'Absent'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusToggle(idx, st)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                          r.status === st
                            ? st === 'Present'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : st === 'Late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-rose-500 text-white shadow-sm'
                            : 'border border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setEditingAttendance(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Save Edits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
