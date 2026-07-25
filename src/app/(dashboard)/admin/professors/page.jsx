'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Plus, Mail, Phone, Lock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageProfessorsPage() {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);

  // Form states for creating professor
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Form states for assigning subject
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assignments, setAssignments] = useState([]);

  const fetchProfessors = async () => {
    try {
      const res = await fetch('/api/admin/professors');
      const data = await res.json();
      if (data.success) {
        setProfessors(data.data.professors);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/admin/assign-subject');
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data.assignments);
      }
    } catch (err) {}
  };

  const fetchClassesAndSubjects = async () => {
    try {
      const classRes = await fetch('/api/admin/classes');
      const classData = await classRes.json();
      if (classData.success) setClasses(classData.data.classes);
    } catch (err) {}
  };

  useEffect(() => {
    fetchProfessors();
    fetchAssignments();
    fetchClassesAndSubjects();
  }, []);

  const handleClassChange = async (cId) => {
    setSelectedClassId(cId);
    if (!cId) {
      setSubjects([]);
      return;
    }
    const res = await fetch(`/api/admin/subjects?classId=${cId}`);
    const data = await res.json();
    if (data.success) setSubjects(data.data.subjects);
  };

  const handleCreateProfessor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to create professor');
        return;
      }
      toast.success('Professor registered successfully!');
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      fetchProfessors();
    } catch (err) {
      toast.error('Error creating professor');
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    if (!selectedProf || !selectedClassId || !selectedSubjectId) {
      toast.error('Please select professor, class, and subject');
      return;
    }

    try {
      const res = await fetch('/api/admin/assign-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: selectedProf._id,
          classId: selectedClassId,
          subjectId: selectedSubjectId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Assignment failed');
        return;
      }
      toast.success(`Assigned subject to Prof. ${selectedProf.name}!`);
      setShowAssignModal(false);
      fetchAssignments();
    } catch (err) {
      toast.error('Error assigning subject');
    }
  };

  const toggleStatus = async (prof) => {
    const newStatus = prof.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/professors/${prof._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchProfessors();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Faculty & Professors</h1>
          <p className="text-xs text-muted-foreground">Manage faculty members and subject allocations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Professor
        </button>
      </div>

      {/* Professors List Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3.5">Professor</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Assigned Subjects</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    Loading faculty directory...
                  </td>
                </tr>
              ) : professors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                    No professors registered yet.
                  </td>
                </tr>
              ) : (
                professors.map((prof) => {
                  const profAssignments = assignments.filter(
                    (a) => a.professorId?._id === prof._id
                  );
                  return (
                    <tr key={prof._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {prof.name.charAt(0)}
                          </div>
                          <span>Prof. {prof.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{prof.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{prof.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profAssignments.length === 0 ? (
                            <span className="text-muted-foreground text-[11px]">Unassigned</span>
                          ) : (
                            profAssignments.map((a) => (
                              <span
                                key={a._id}
                                className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground"
                              >
                                {a.classId?.className} - {a.subjectId?.subjectName}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            prof.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {prof.status === 'ACTIVE' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {prof.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProf(prof);
                            setShowAssignModal(true);
                          }}
                          className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium hover:bg-muted"
                        >
                          + Assign Subject
                        </button>
                        <button
                          onClick={() => toggleStatus(prof)}
                          className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          Toggle Active
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Professor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">Register New Professor</h2>
            <form onSubmit={handleCreateProfessor} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prof. Rajesh Sharma"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@khmw.edu.in"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
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
                  Save Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subject Modal */}
      {showAssignModal && selectedProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] flex flex-col">
            <h2 className="px-6 pt-6 text-lg font-bold text-foreground">
              Assign Class & Subject to Prof. {selectedProf.name}
            </h2>
            <form onSubmit={handleAssignSubject} className="mt-4 space-y-4 overflow-y-auto px-6 pb-6 flex-1 min-h-0">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  disabled={!selectedClassId}
                  size={Math.min(subjects.length + 1, 8)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs disabled:opacity-50"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      [{s.subjectCode}] {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sticky bottom-0 bg-card pt-4 flex justify-end gap-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
