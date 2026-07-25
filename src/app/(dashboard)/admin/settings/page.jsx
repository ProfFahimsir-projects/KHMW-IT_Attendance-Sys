'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [minThreshold, setMinThreshold] = useState('75');
  const [collegeName, setCollegeName] = useState('KHMW College of Commerce');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">College Portal Settings</h1>
        <p className="text-xs text-muted-foreground">Configure threshold limits and institution parameters</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Institution Name</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Minimum Attendance Threshold (%)
            </label>
            <input
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Students falling below this attendance ratio will be flagged in low-attendance alerts.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
