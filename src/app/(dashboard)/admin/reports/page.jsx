'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    fetch('/api/admin/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClasses(data.data.classes);
      });
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let url = '/api/attendance/view?';
      if (selectedClassId) url += `classId=${selectedClassId}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        // Flatten attendance records into downloadable sheet
        const rows = [];
        data.data.attendances.forEach((session) => {
          session.records.forEach((rec) => {
            rows.push({
              Date: new Date(session.date).toLocaleDateString('en-IN'),
              Lecture: session.lectureNumber,
              Class: session.classId?.className || '',
              Subject: session.subjectId?.subjectName || '',
              RollNumber: rec.studentId?.rollNumber || '',
              StudentName: rec.studentId?.studentName || '',
              Status: rec.status,
              StudentContact: rec.studentId?.contactNumber || '',
              FatherContact: rec.studentId?.fatherContactNumber || '',
              MotherContact: rec.studentId?.motherContactNumber || '',
              MarkedBy: session.markedByProfessorId?.name || '',
            });
          });
        });
        setReportData(rows);
        toast.success(`Generated report with ${rows.length} entries`);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch report data');
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Please generate report first');
      return;
    }
    exportToCSV(`KHMW_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`, reportData);
    toast.success('Downloaded Attendance Report CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Attendance Reports</h1>
          <p className="text-xs text-muted-foreground">Export comprehensive attendance matrices for college audit</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={reportData.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export to CSV / Excel
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-foreground mb-1">Select Target Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          {loading ? 'Processing...' : 'Generate Matrix Report'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 border-b border-border/60 bg-muted/90 backdrop-blur-md font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Lecture</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Gr No.</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    Click &quot;Generate Matrix Report&quot; to load data.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
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
    </div>
  );
}
