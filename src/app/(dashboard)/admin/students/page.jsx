'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Plus, Phone, Trash2, Edit3, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);

  // Form states strictly limited to requested 5 fields
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [fatherContactNumber, setFatherContactNumber] = useState('');
  const [motherContactNumber, setMotherContactNumber] = useState('');
  const [formClassId, setFormClassId] = useState('');

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      if (data.success) setClasses(data.data.classes);
    } catch (err) {}
  };

  const fetchStudents = async (cId = selectedClassId) => {
    setLoading(true);
    try {
      let url = '/api/admin/students';
      if (cId) url += `?classId=${cId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data.students);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const handleClassFilterChange = (cId) => {
    setSelectedClassId(cId);
    fetchStudents(cId);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!rollNumber || !studentName || !contactNumber || !fatherContactNumber || !formClassId) {
      toast.error('All required fields must be filled');
      return;
    }

    const payload = {
      rollNumber,
      studentName,
      contactNumber,
      fatherContactNumber,
      motherContactNumber,
      classId: formClassId,
    };

    try {
      let res, data;
      if (editStudentId) {
        res = await fetch(`/api/admin/students/${editStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Operation failed');
        return;
      }

      toast.success(editStudentId ? 'Student updated successfully!' : 'Student created successfully!');
      setShowModal(false);
      resetForm();
      fetchStudents(selectedClassId);
    } catch (err) {
      toast.error('Error saving student');
    }
  };

  const resetForm = () => {
    setRollNumber('');
    setStudentName('');
    setContactNumber('');
    setFatherContactNumber('');
    setMotherContactNumber('');
    setFormClassId('');
    setEditStudentId(null);
  };

  const handleEditClick = (std) => {
    setEditStudentId(std._id);
    setRollNumber(std.rollNumber);
    setStudentName(std.studentName);
    setContactNumber(std.contactNumber);
    setFatherContactNumber(std.fatherContactNumber);
    setMotherContactNumber(std.motherContactNumber);
    setFormClassId(std.classId?._id || std.classId);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this student profile?')) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Student deleted');
        fetchStudents(selectedClassId);
      }
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Student Roster Management</h1>
          <p className="text-xs text-muted-foreground">Manage enrolled students and contact records</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Student Profile
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedClassId}
            onChange={(e) => handleClassFilterChange(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs"
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

      {/* Student Table */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3.5">Roll No.</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Class</th>
                <th className="px-6 py-3.5">Student Contact</th>
                <th className="px-6 py-3.5">Father Contact</th>
                <th className="px-6 py-3.5">Mother Contact</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    Loading student roster...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{std.rollNumber}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{std.studentName}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {std.classId?.className || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <a href={`tel:${std.contactNumber}`} className="hover:text-primary underline">
                        {std.contactNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <a href={`tel:${std.fatherContactNumber}`} className="hover:text-primary underline">
                        {std.fatherContactNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      <a href={`tel:${std.motherContactNumber}`} className="hover:text-primary underline">
                        {std.motherContactNumber}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => router.push(`/admin/students/${std._id}`)}
                        className="rounded-lg border border-primary/30 bg-primary/10 p-1.5 text-primary hover:bg-primary hover:text-primary-foreground"
                        title="View Attendance"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(std)}
                        className="rounded-lg border border-border bg-muted/40 p-1.5 text-muted-foreground hover:text-foreground"
                        title="Edit Student"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(std._id)}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete Student"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">
              {editStudentId ? 'Edit Student Profile' : 'Add New Student Profile'}
            </h2>
            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select Class</label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="2025001"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Aarav Sharma"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="9876543201"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Father Contact Number</label>
                <input
                  type="tel"
                  value={fatherContactNumber}
                  onChange={(e) => setFatherContactNumber(e.target.value)}
                  placeholder="9876543211"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Mother Contact Number <span className="text-muted-foreground">(optional)</span></label>
                <input
                  type="tel"
                  value={motherContactNumber}
                  onChange={(e) => setMotherContactNumber(e.target.value)}
                  placeholder="9876543221"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
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
                  {editStudentId ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
