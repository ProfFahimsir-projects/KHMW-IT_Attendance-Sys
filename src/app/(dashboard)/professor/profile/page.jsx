'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfessorProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.user) {
          setUser(data.data.user);
          setName(data.data.user.name || '');
          setEmail(data.data.user.email || '');
          setPhone(data.data.user.phone || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { name, phone };
      if (newPassword) {
        if (!currentPassword) {
          toast.error('Enter current password to set a new password');
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error('New password and confirm password do not match');
          setSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/professor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update profile');
        setSaving(false);
        return;
      }

      toast.success('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUser((prev) => ({ ...prev, name, phone }));
    } catch (err) {
      toast.error('Error updating profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">My Profile</h1>
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted-foreground shadow-sm">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-xs text-muted-foreground">Update your personal information and password</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{user?.name}</h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                <CheckCircle className="h-3 w-3" />
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                <User className="inline h-3 w-3 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                <Mail className="inline h-3 w-3 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-input bg-muted/50 px-3 py-2 text-xs opacity-60 cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                <Phone className="inline h-3 w-3 mr-1" />
                Contact Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Change Password</h3>
              <p className="text-[10px] text-muted-foreground">Leave blank to keep current password</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
