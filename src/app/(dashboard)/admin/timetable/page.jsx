'use client';

import { useState, useEffect } from 'react';
import { WEEKDAYS, DEFAULT_LECTURE_SLOTS } from '@/lib/constants';
import { Clock, Plus, Trash2, Calendar, School, UserCheck, BookOpen, MapPin, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTimetablePage() {
  const [viewMode, setViewMode] = useState('class'); // 'class' or 'professor'
  const [classes, setClasses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedProfId, setSelectedProfId] = useState('');

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formProfId, setFormProfId] = useState('');
  const [formDay, setFormDay] = useState('Monday');
  const [formLectureNumber, setFormLectureNumber] = useState('Lecture 1');
  const [formStartTime, setFormStartTime] = useState('07:30 AM');
  const [formEndTime, setFormEndTime] = useState('08:20 AM');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch('/api/admin/classes'),
          fetch('/api/admin/professors'),
        ]);

        const cData = await cRes.json();
        const pData = await pRes.json();

        if (cData.success && cData.data.classes.length > 0) {
          setClasses(cData.data.classes);
          setSelectedClassId(cData.data.classes[0]._id);
          setFormClassId(cData.data.classes[0]._id);
        }

        if (pData.success) {
          setProfessors(pData.data.professors);
          if (pData.data.professors.length > 0) {
            setSelectedProfId(pData.data.professors[0]._id);
          }
        }
      } catch (err) {
        console.error('Metadata load error:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch timetable whenever filter parameters change
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/timetable?';
      if (viewMode === 'class' && selectedClassId) {
        url += `classId=${selectedClassId}`;
      } else if (viewMode === 'professor' && selectedProfId) {
        url += `professorId=${selectedProfId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTimetable(data.data.timetable);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load timetable');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [viewMode, selectedClassId, selectedProfId]);

  // Fetch subjects when formClassId changes in Modal
  useEffect(() => {
    if (!formClassId) {
      setSubjects([]);
      return;
    }
    fetch(`/api/admin/subjects?classId=${formClassId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubjects(data.data.subjects);
          if (data.data.subjects.length > 0) {
            setFormSubjectId(data.data.subjects[0]._id);
          } else {
            setFormSubjectId('');
          }
        }
      });
  }, [formClassId]);

  // Auto-fill time when lecture slot changes
  const handleLectureChange = (lecNum) => {
    setFormLectureNumber(lecNum);
    const slot = DEFAULT_LECTURE_SLOTS.find((s) => s.lectureNumber === lecNum);
    if (slot) {
      setFormStartTime(slot.startTime);
      setFormEndTime(slot.endTime);
    }
  };

  const handleAddTimetableEntry = async (e) => {
    e.preventDefault();
    if (!formClassId || !formSubjectId || !formProfId || !formDay || !formLectureNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: formClassId,
          subjectId: formSubjectId,
          professorId: formProfId,
          day: formDay,
          lectureNumber: formLectureNumber,
          startTime: formStartTime,
          endTime: formEndTime,
          roomNumber: formRoomNumber,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to add timetable slot');
        return;
      }

      toast.success(data.message || 'Timetable slot created successfully!');
      setShowModal(false);
      fetchTimetable();
    } catch (err) {
      setSubmitting(false);
      toast.error('Error creating timetable slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('Are you sure you want to remove this lecture slot from the timetable?')) return;
    try {
      const res = await fetch(`/api/admin/timetable?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Timetable slot deleted');
        fetchTimetable();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Error deleting slot');
    }
  };

  // Helper map for fast grid lookup: key = `${day}_${lectureNumber}`
  const gridMap = {};
  timetable.forEach((entry) => {
    const key = `${entry.day}_${entry.lectureNumber}`;
    gridMap[key] = entry;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Timetable Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure weekly lecture schedules for classes and faculty members
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Schedule Slot
        </button>
      </div>

      {/* Control Bar: View Switcher & Selector Filter */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Mode */}
        <div className="flex items-center rounded-xl bg-muted p-1">
          <button
            onClick={() => setViewMode('class')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'class'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <School className="h-3.5 w-3.5" />
            Class Timetable
          </button>
          <button
            onClick={() => setViewMode('professor')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'professor'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Professor Timetable
          </button>
        </div>

        {/* Dynamic Selector Dropdown */}
        <div className="flex items-center gap-3">
          {viewMode === 'class' ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Select Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className} (Div {c.division})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Select Professor:</label>
              <select
                value={selectedProfId}
                onChange={(e) => setSelectedProfId(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                {professors.map((p) => (
                  <option key={p._id} value={p._id}>
                    Prof. {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Timetable Table Matrix */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/50 font-semibold text-muted-foreground uppercase">
                <th className="w-32 border-r border-border/40 px-4 py-3 text-center">Day</th>
                {DEFAULT_LECTURE_SLOTS.map((slot) => (
                  <th key={slot.lectureNumber} className="min-w-[160px] border-r border-border/40 px-3 py-3 text-center">
                    <span className="block font-bold text-foreground">{slot.lectureNumber}</span>
                    <span className="block text-[10px] text-muted-foreground font-normal">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-xs text-muted-foreground">
                    Loading timetable grid...
                  </td>
                </tr>
              ) : (
                WEEKDAYS.map((day) => (
                  <tr key={day} className="hover:bg-muted/20 transition-colors">
                    {/* Day Column */}
                    <td className="border-r border-border/40 bg-muted/30 px-4 py-4 text-center font-bold text-foreground">
                      {day}
                    </td>

                    {/* Lecture Slot Cells */}
                    {DEFAULT_LECTURE_SLOTS.map((slot) => {
                      const key = `${day}_${slot.lectureNumber}`;
                      const entry = gridMap[key];

                      return (
                        <td key={slot.lectureNumber} className="border-r border-border/40 p-2 vertical-top">
                          {entry ? (
                            <div className="group relative rounded-xl border border-primary/20 bg-primary/5 p-2.5 shadow-sm transition-all hover:border-primary hover:shadow-md dark:bg-primary/10">
                              <div className="flex items-start justify-between gap-1">
                                <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-extrabold text-primary">
                                  {entry.subjectId?.subjectCode}
                                </span>
                                <button
                                  onClick={() => handleDeleteSlot(entry._id)}
                                  className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                  title="Delete lecture slot"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <h4 className="mt-1.5 text-xs font-bold text-foreground line-clamp-1">
                                {entry.subjectId?.subjectName}
                              </h4>

                              <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                                {viewMode === 'class' ? (
                                  <p className="font-medium text-foreground/80 flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 text-primary" />
                                    Prof. {entry.professorId?.name || 'N/A'}
                                  </p>
                                ) : (
                                  <p className="font-medium text-foreground/80 flex items-center gap-1">
                                    <School className="h-3 w-3 text-primary" />
                                    {entry.classId?.className}
                                  </p>
                                )}

                                {entry.roomNumber && (
                                  <p className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {entry.roomNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border/40 p-2 text-center text-[10px] text-muted-foreground/50">
                              Free Slot
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Timetable Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Add Lecture Schedule Slot
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTimetableEntry} className="mt-4 space-y-3">
              {/* Select Class */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Class</label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className} (Div {c.division})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Subject */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Subject</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  required
                  disabled={!formClassId || subjects.length === 0}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs disabled:opacity-50"
                >
                  {subjects.length === 0 ? (
                    <option value="">No subjects found for this class</option>
                  ) : (
                    subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        [{s.subjectCode}] {s.subjectName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Select Professor */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Assigned Professor</label>
                <select
                  value={formProfId}
                  onChange={(e) => setFormProfId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">-- Choose Professor --</option>
                  {professors.map((p) => (
                    <option key={p._id} value={p._id}>
                      Prof. {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Lecture Number Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Lecture Slot</label>
                  <select
                    value={formLectureNumber}
                    onChange={(e) => handleLectureChange(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-primary"
                  >
                    {DEFAULT_LECTURE_SLOTS.map((s) => (
                      <option key={s.lectureNumber} value={s.lectureNumber}>
                        {s.lectureNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start & End Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="07:30 AM"
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">End Time</label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="08:20 AM"
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Room / Lab Number (Optional)</label>
                <input
                  type="text"
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                  placeholder="e.g. Room 302 or IT Lab 1"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {submitting ? 'Creating Slot...' : 'Save Timetable Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
