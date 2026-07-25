'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/common/StatCard';
import { Users, GraduationCap, School, BarChart3, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            College Overview & Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time attendance monitor for KHMW College of Commerce
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/students"
            className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            + Add Student
          </Link>
          <Link
            href="/admin/professors"
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all"
          >
            + Register Professor
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Active Students"
          value={loading ? '...' : stats?.totalStudents || '0'}
          subtitle="Enrolled across all classes"
          icon={GraduationCap}
          colorGradient="from-blue-500/10 to-indigo-500/5"
        />
        <StatCard
          title="Faculty Members"
          value={loading ? '...' : stats?.totalProfessors || '0'}
          subtitle="Professors assigned"
          icon={Users}
          colorGradient="from-purple-500/10 to-pink-500/5"
        />
        <StatCard
          title="College Attendance Rate"
          value={loading ? '...' : `${stats?.overallPercentage || 0}%`}
          subtitle="Target threshold >= 75%"
          icon={BarChart3}
          trend={stats?.overallPercentage >= 75 ? '+ Optimal Level' : '⚠️ Action Required'}
          colorGradient="from-emerald-500/10 to-teal-500/5"
        />
        <StatCard
          title="Active Academic Year"
          value={loading ? '...' : stats?.activeAcademicYear || '2025-2026'}
          subtitle="Unlimited historical support"
          icon={School}
          colorGradient="from-amber-500/10 to-orange-500/5"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend Area Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Monthly Attendance Average</h2>
              <p className="text-xs text-muted-foreground">Percentage trend for current academic term</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyStats || []}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    borderColor: '#334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAttendance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class-Wise Comparison Bar Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Class-wise Attendance Ratio</h2>
              <p className="text-xs text-muted-foreground">FY BSc IT vs SY BSc IT vs TY BSc IT</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.classComparison || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="className" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    borderColor: '#334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attendance" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/attendance-management"
          className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Attendance Hub</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="mt-2 text-sm font-bold text-foreground">Edit & Audit Records</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Admin override for past lecture records</p>
        </Link>

        <Link
          href="/admin/reports"
          className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Reports Generator</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="mt-2 text-sm font-bold text-foreground">Export Excel / CSV</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Download class attendance matrix</p>
        </Link>

        <Link
          href="/admin/academic-years"
          className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Academic Structure</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="mt-2 text-sm font-bold text-foreground">Manage Academic Years</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Configure future sessions & terms</p>
        </Link>
      </div>
    </div>
  );
}
