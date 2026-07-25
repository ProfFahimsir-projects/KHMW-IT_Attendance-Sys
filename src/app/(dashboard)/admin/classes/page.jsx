'use client';

import { useState, useEffect } from 'react';
import { School, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageClassesPage() {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [className, setClassName] = useState('');
  const [division, setDivision] = useState('A');
  const [academicYearId, setAcademicYearId] = useState('');

  const fetchData = async () => {
    try {
      const yearRes = await fetch('/api/admin/academic-years');
      const yearData = await yearRes.json();
      if (yearData.success) {
        setAcademicYears(yearData.data.academicYears);
        const current = yearData.data.academicYears.find((y) => y.isCurrent);
        if (current) setAcademicYearId(current._id);
      }

      const classRes = await fetch('/api/admin/classes');
      const classData = await classRes.json();
      if (classData.success) setClasses(classData.data.classes);

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className || !academicYearId) {
      toast.error('Class name and academic year are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, division, academicYearId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to add class');
        return;
      }
      toast.success(`Class ${className} added successfully!`);
      setShowModal(false);
      setClassName('');
      fetchData();
    } catch (err) {
      toast.error('Error adding class');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Academic Classes</h1>
          <p className="text-xs text-muted-foreground">Manage college degree classes (FY BSc IT, SY BSc IT, TY BSc IT)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Class
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center text-xs text-muted-foreground">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="col-span-full text-center text-xs text-muted-foreground">No classes created yet.</p>
        ) : (
          classes.map((c) => (
            <div
              key={c._id}
              onClick={() => setSelectedClass(c)}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/50 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  <School className="h-5 w-5" />
                </div>
                <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                  Division {c.division}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">{c.className}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Academic Term: {c.academicYearId?.yearLabel || 'Active Session'}
              </p>
              <p className="mt-2 text-[10px] font-medium text-primary">
                {c.subjects?.length || 0} subject{(c.subjects?.length || 0) !== 1 ? 's' : ''} &middot; View details &rarr;
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">Add New Class</h2>
            <form onSubmit={handleCreateClass} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. FY BSc IT"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Division</label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="A"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Academic Year</label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">-- Select Academic Year --</option>
                  {academicYears.map((y) => (
                    <option key={y._id} value={y._id}>
                      {y.yearLabel} {y.isCurrent ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Subjects Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedClass.className}</h2>
                <p className="text-xs text-muted-foreground">
                  Division {selectedClass.division} &middot; {selectedClass.academicYearId?.yearLabel || 'Active Session'}
                </p>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-4">
              {selectedClass.subjects && selectedClass.subjects.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground">#</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground">Code</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground">Subject Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClass.subjects.map((s, i) => (
                        <tr key={s._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2.5 font-semibold text-foreground">{s.subjectCode}</td>
                          <td className="px-4 py-2.5 text-foreground">{s.subjectName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground py-8 italic">No subjects assigned to this class yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
