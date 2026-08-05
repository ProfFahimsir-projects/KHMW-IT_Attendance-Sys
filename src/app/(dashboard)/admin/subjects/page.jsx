'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterClassId, setFilterClassId] = useState('');

  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [classId, setClassId] = useState('');

  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async (classId = filterClassId) => {
    setLoading(true);
    try {
      const query = classId ? `?classId=${encodeURIComponent(classId)}` : '';
      const subRes = await fetch(`/api/admin/subjects${query}`);
      const subData = await subRes.json();
      if (subData.success) setSubjects(subData.data.subjects);
    } catch (err) {
      toast.error('Error loading subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
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

  useEffect(() => {
    fetchSubjects(filterClassId);
  }, [filterClassId]);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !classId) {
      toast.error('Subject code, name, and class are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectCode, subjectName, classId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to add subject');
        return;
      }
      toast.success(`Subject ${subjectName} created successfully!`);
      setShowModal(false);
      setSubjectCode('');
      setSubjectName('');
      setClassId('');
      fetchSubjects();
    } catch (err) {
      toast.error('Error adding subject');
    }
  };

  const handleEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectCode(sub.subjectCode);
    setSubjectName(sub.subjectName);
    setClassId(sub.classId?._id || sub.classId);
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !classId) {
      toast.error('Subject code, name, and class are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subjects/${editingSubject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectCode, subjectName, classId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update subject');
        return;
      }
      toast.success(`Subject ${subjectName} updated successfully!`);
      setEditingSubject(null);
      setSubjectCode('');
      setSubjectName('');
      setClassId('');
      fetchSubjects();
    } catch (err) {
      toast.error('Error updating subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/subjects/${deletingSubject._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to delete subject');
        return;
      }
      toast.success(`Subject ${deletingSubject.subjectName} deleted successfully!`);
      setDeletingSubject(null);
      fetchSubjects();
    } catch (err) {
      toast.error('Error deleting subject');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Subjects Catalog</h1>
          <p className="text-xs text-muted-foreground">Manage curriculum subjects by class</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="class-filter" className="mb-1 block text-xs font-semibold text-foreground">
            Filter by Class
          </label>
          <select
            id="class-filter"
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:w-64"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3.5">Subject Code</th>
                <th className="px-6 py-3.5">Subject Title</th>
                <th className="px-6 py-3.5">Assigned Class</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    Loading subjects...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                    {filterClassId ? 'No subjects found for this class.' : 'No subjects cataloged yet.'}
                  </td>
                </tr>
              ) : (
                subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{sub.subjectCode}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{sub.subjectName}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {sub.classId?.className || 'Unlinked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditSubject(sub)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingSubject(sub)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">Catalog New Subject</h2>
            <form onSubmit={handleCreateSubject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="BSCIT-101"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Subject Title</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Imperative Programming"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
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
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">Edit Subject</h2>
            <form onSubmit={handleUpdateSubject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Subject Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="BSCIT-101"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Subject Title</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Imperative Programming"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">Delete Subject</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">{deletingSubject.subjectName}</span> (
              {deletingSubject.subjectCode})? This will also remove related assignments, timetable
              entries, and attendance records.
            </p>
            <div className="mt-6 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubject}
                disabled={deleting}
                className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
