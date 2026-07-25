'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageAcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [yearLabel, setYearLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  const fetchYears = async () => {
    try {
      const res = await fetch('/api/admin/academic-years');
      const data = await res.json();
      if (data.success) {
        setAcademicYears(data.data.academicYears);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!yearLabel || !startDate || !endDate) {
      toast.error('All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearLabel, startDate, endDate, isCurrent }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to add academic year');
        return;
      }
      toast.success(`Academic Year ${yearLabel} added!`);
      setShowModal(false);
      setYearLabel('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      fetchYears();
    } catch (err) {
      toast.error('Error creating academic year');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Academic Years</h1>
          <p className="text-xs text-muted-foreground">Support for unlimited current and future academic terms</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Academic Year
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center text-xs text-muted-foreground">Loading academic years...</p>
        ) : academicYears.length === 0 ? (
          <p className="col-span-full text-center text-xs text-muted-foreground">No terms configured yet.</p>
        ) : (
          academicYears.map((year) => (
            <div
              key={year._id}
              className={`rounded-2xl border p-5 shadow-sm transition-all ${
                year.isCurrent
                  ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10'
                  : 'border-border/60 bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold text-foreground">{year.yearLabel}</span>
                {year.isCurrent && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3 w-3" /> Active Term
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <p>Start Date: {new Date(year.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(year.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">Configure New Academic Year</h2>
            <form onSubmit={handleCreateYear} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Year Label</label>
                <input
                  type="text"
                  value={yearLabel}
                  onChange={(e) => setYearLabel(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                <label htmlFor="isCurrent" className="text-xs text-foreground font-medium">
                  Set as Active Academic Term
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Save Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
