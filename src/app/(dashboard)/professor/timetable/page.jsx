'use client';

import { useState, useEffect } from 'react';
import { WEEKDAYS, DEFAULT_LECTURE_SLOTS } from '@/lib/constants';
import { Clock, School, UserCheck, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfessorTimetablePage() {
  const [tab, setTab] = useState('personal'); // 'personal' or 'class'
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Today's day name (e.g. "Monday", "Wednesday")
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = `/api/professor/timetable?viewMode=${tab}`;
      if (tab === 'class' && selectedClassId) {
        url += `&classId=${selectedClassId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTimetable(data.data.timetable);

        if (data.data.assignedClasses && data.data.assignedClasses.length > 0) {
          setAssignedClasses(data.data.assignedClasses);
          if (!selectedClassId) {
            setSelectedClassId(data.data.assignedClasses[0]._id);
          }
        }
      }
      setLoading(false);
    } catch (err) {
      toast.error('Error fetching timetable');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [tab, selectedClassId]);

  // Construct grid map: key = `${day}_${lectureNumber}`
  const gridMap = {};
  timetable.forEach((entry) => {
    const key = `${entry.day}_${entry.lectureNumber}`;
    gridMap[key] = entry;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Lecture Timetable
          </h1>
          <p className="text-xs text-muted-foreground">
            View your personal weekly teaching schedule and class timetables
          </p>
        </div>

        {/* Current Day Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
          <Calendar className="h-4 w-4" />
          <span>Today: {todayDayName}</span>
        </div>
      </div>

      {/* Control Bar: Tabs & Class Dropdown */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center rounded-xl bg-muted p-1">
          <button
            onClick={() => setTab('personal')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === 'personal'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            My Teaching Schedule
          </button>
          <button
            onClick={() => setTab('class')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === 'class'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <School className="h-3.5 w-3.5" />
            Class Timetable View
          </button>
        </div>

        {/* Class Selector (Visible when 'class' tab is active) */}
        {tab === 'class' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground">Select Assigned Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              {assignedClasses.length === 0 ? (
                <option value="">No assigned classes found</option>
              ) : (
                assignedClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className} (Div {c.division})
                  </option>
                ))
              )}
            </select>
          </div>
        )}
      </div>

      {/* Weekly Matrix Table */}
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
                    Loading timetable matrix...
                  </td>
                </tr>
              ) : (
                WEEKDAYS.map((day) => {
                  const isToday = day === todayDayName;

                  return (
                    <tr
                      key={day}
                      className={`transition-colors ${
                        isToday ? 'bg-primary/5 dark:bg-primary/10 font-bold' : 'hover:bg-muted/20'
                      }`}
                    >
                      {/* Day Name */}
                      <td
                        className={`border-r border-border/40 px-4 py-4 text-center font-bold ${
                          isToday ? 'bg-primary/15 text-primary' : 'bg-muted/30 text-foreground'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span>{day}</span>
                          {isToday && (
                            <span className="mt-1 flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-extrabold text-primary">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Today
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Slots */}
                      {DEFAULT_LECTURE_SLOTS.map((slot) => {
                        const key = `${day}_${slot.lectureNumber}`;
                        const entry = gridMap[key];

                        return (
                          <td key={slot.lectureNumber} className="border-r border-border/40 p-2 vertical-top">
                            {entry ? (
                              <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm transition-all hover:border-primary/50">
                                <span className="inline-block rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-extrabold text-primary">
                                  {entry.subjectId?.subjectCode}
                                </span>

                                <h4 className="mt-1.5 text-xs font-bold text-foreground line-clamp-1">
                                  {entry.subjectId?.subjectName}
                                </h4>

                                <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                                  {tab === 'personal' ? (
                                    <p className="font-semibold text-foreground/90 flex items-center gap-1">
                                      <School className="h-3 w-3 text-primary" />
                                      {entry.classId?.className}
                                    </p>
                                  ) : (
                                    <p className="font-semibold text-foreground/90 flex items-center gap-1">
                                      <UserCheck className="h-3 w-3 text-primary" />
                                      Prof. {entry.professorId?.name || 'N/A'}
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
                              <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border/30 p-2 text-center text-[10px] text-muted-foreground/40">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
