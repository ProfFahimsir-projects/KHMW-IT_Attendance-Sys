'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Search, BookOpen, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfessorReportsPage() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [viewMode, setViewMode] = useState('detailed');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/professor/assigned')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAssignments(data.data.assignments);
      });
  }, []);

  const uniqueClasses = Array.from(
    new Map(assignments.map((a) => [a.classId?._id, a.classId])).values()
  ).filter(Boolean);

  const handleClassChange = async (cId) => {
    setSelectedClassId(cId);
    setSelectedSubjectId('');
    setSelectedStudentId('');
    setSubjects([]);
    setStudents([]);
    setReportData([]);

    if (!cId) return;

    const classAssignments = assignments.filter((a) => a.classId?._id === cId);
    const uniqueSubjects = Array.from(
      new Map(classAssignments.map((a) => [a.subjectId?._id, a.subjectId])).values()
    ).filter(Boolean);
    setSubjects(uniqueSubjects);

    try {
      const res = await fetch(`/api/professor/students?classId=${cId}`);
      const data = await res.json();
      if (data.success) setStudents(data.data.students);
    } catch (err) {}
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let url = '/api/attendance/view?';
      if (selectedClassId) url += `classId=${selectedClassId}&`;
      if (selectedSubjectId) url += `subjectId=${selectedSubjectId}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const rows = [];
        data.data.attendances.forEach((session) => {
          session.records.forEach((rec) => {
            rows.push({
              Date: new Date(session.date).toLocaleDateString('en-IN'),
              Lecture: session.lectureNumber,
              Class: session.classId?.className || '',
              Subject: session.subjectId?.subjectName || '',
              SubjectCode: session.subjectId?.subjectCode || '',
              RollNumber: rec.studentId?.rollNumber || '',
              StudentName: rec.studentId?.studentName || '',
              StudentId: rec.studentId?._id || '',
              Status: rec.status,
            });
          });
        });
        setReportData(rows);
        toast.success(`Loaded ${rows.length} attendance records`);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load reports');
      setLoading(false);
    }
  };

  const filteredData = reportData.filter((row) => {
    if (selectedStudentId && row.StudentId !== selectedStudentId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        row.StudentName.toLowerCase().includes(term) ||
        row.RollNumber.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const studentSummary = {};
  for (const row of filteredData) {
    const key = row.StudentId || row.RollNumber;
    if (!studentSummary[key]) {
      studentSummary[key] = {
        rollNumber: row.RollNumber,
        studentName: row.StudentName,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      };
    }
    studentSummary[key].total++;
    if (row.Status === 'Present') studentSummary[key].present++;
    else if (row.Status === 'Absent') studentSummary[key].absent++;
    else if (row.Status === 'Late') studentSummary[key].late++;
  }

  const summaryRows = Object.values(studentSummary)
    .map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0,
    }))
    .sort((a, b) => a.rollNumber?.localeCompare(b.rollNumber));

  const handleExport = () => {
    if (viewMode === 'summary') {
      if (summaryRows.length === 0) {
        toast.error('Generate report first');
        return;
      }
      const exportRows = summaryRows.map((s) => ({
        RollNumber: s.rollNumber,
        StudentName: s.studentName,
        TotalClasses: s.total,
        Present: s.present,
        Absent: s.absent,
        Late: s.late,
        AttendancePercent: s.percentage + '%',
      }));
      exportToCSV(`Professor_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`, exportRows);
    } else {
      if (filteredData.length === 0) {
        toast.error('Generate report first');
        return;
      }
      exportToCSV(`Professor_Detailed_Report_${new Date().toISOString().slice(0, 10)}.csv`, filteredData);
    }
    toast.success('Downloaded Report CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Lecture Reports</h1>
          <p className="text-xs text-muted-foreground">View attendance reports by class, subject, and individual student</p>
        </div>
        <button
          onClick={handleExport}
          disabled={viewMode === 'summary' ? summaryRows.length === 0 : filteredData.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-foreground mb-1">
              <Users className="inline h-3 w-3 mr-1" />
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
            >
              <option value="">-- Choose Class --</option>
              {uniqueClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.className} {c.division ? `- ${c.division}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-foreground mb-1">
              <BookOpen className="inline h-3 w-3 mr-1" />
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!selectedClassId}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs disabled:opacity-50"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  [{s.subjectCode}] {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-foreground mb-1">
              <Users className="inline h-3 w-3 mr-1" />
              Individual Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!selectedClassId}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs disabled:opacity-50"
            >
              <option value="">All Students</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.rollNumber} - {s.studentName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading || !selectedClassId}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* View Mode Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-1 shadow-sm">
          <button
            onClick={() => setViewMode('detailed')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              viewMode === 'detailed'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Detailed View
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              viewMode === 'summary'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Class Summary
          </button>
        </div>

        {viewMode === 'detailed' && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by student name or roll no..."
              className="w-full sm:w-64 rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs"
            />
          </div>
        )}
      </div>

      {/* Class Summary View */}
      {viewMode === 'summary' && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/60 bg-muted/40 px-5 py-3">
            <h3 className="text-sm font-bold text-foreground">Class Attendance Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Roll No.</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3 text-center">Total</th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-emerald-600">Present</span>
                  </th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-red-600">Absent</span>
                  </th>
                  <th className="px-5 py-3 text-center">
                    <span className="text-amber-600">Late</span>
                  </th>
                  <th className="px-5 py-3 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-muted-foreground">
                      Generate a report to see class summary.
                    </td>
                  </tr>
                ) : (
                  summaryRows.map((s, idx) => (
                    <tr key={s.rollNumber} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                      <td className="px-5 py-3 font-mono font-bold text-primary">{s.rollNumber}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{s.studentName}</td>
                      <td className="px-5 py-3 text-center font-semibold text-foreground">{s.total}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> {s.present}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                          <XCircle className="h-3 w-3" /> {s.absent}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                          <Clock className="h-3 w-3" /> {s.late}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${
                                s.percentage >= 75
                                  ? 'bg-emerald-500'
                                  : s.percentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${s.percentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-foreground min-w-[36px] text-right">{s.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Records View */}
      {viewMode === 'detailed' && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-border/60 bg-muted/90 backdrop-blur-md font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Lecture</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Roll No.</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                      Select class and click &quot;Generate Report&quot; to inspect entries.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{row.Date}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{row.Lecture}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.Class}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.Subject}</td>
                      <td className="px-4 py-3 font-mono font-bold text-primary">{row.RollNumber}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{row.StudentName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            row.Status === 'Present'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : row.Status === 'Late'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {row.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
