import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  Calendar,
  Filter,
  Download,
  RotateCcw,
  Clock,
  IndianRupee,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { apiGetDetailedReport } from '../services/api';

interface ManagerDetailedReportPageProps {
  user: User;
}

export const ManagerDetailedReportPage: React.FC<ManagerDetailedReportPageProps> = ({ user }) => {
  const [fromDate, setFromDate] = useState('2025-10-01');
  const [toDate, setToDate] = useState('2025-10-31');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await apiGetDetailedReport({
        fromDate,
        toDate,
        employeeId: selectedEmployee,
      });
      setData(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownloadReport = () => {
    window.location.href = '/api/payroll/export-csv';
  };

  const summary = data?.summary || {
    totalReopenedTasks: 8,
    totalReworkHours: '42h 30m',
    totalReworkCost: 12750,
    avgFixTime: '5h 20m',
  };

  const moduleBreakdown = data?.moduleBreakdown || [
    { module: 'Login', hours: 12 },
    { module: 'Dashboard', hours: 9 },
    { module: 'Payment', hours: 6 },
    { module: 'Reports', hours: 8 },
    { module: 'Profile', hours: 7 },
  ];

  const recurringDefects = data?.recurringDefects || [
    { module: 'Login', bugCount: 3, avgFixTime: '6h 12m' },
    { module: 'Dashboard', bugCount: 2, avgFixTime: '4h 30m' },
    { module: 'Payment', bugCount: 1, avgFixTime: '3h 15m' },
  ];

  const recentActivity = data?.recentActivity || [
    { date: '16 Oct 2025', action: 'BUG-004 approved (John Doe)' },
    { date: '15 Oct 2025', action: 'BUG-002 fixed (Alex Kumar)' },
    { date: '14 Oct 2025', action: 'BUG-007 reopened (Priya Sharma)' },
    { date: '12 Oct 2025', action: 'BUG-005 fixed (Rahul Verma)' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Export (Image 2: Sub-screen 7 reference) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
            Rework Cost & Quality Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
            Authoritative retrospective analytics on defect density, module stability, and resolution velocity.
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="px-5 py-2.5 bg-corporate-gradient text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:opacity-95 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download CSV Report
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#64748B] font-semibold">From Date:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#64748B] font-semibold">To Date:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#64748B] font-semibold">Employee:</span>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-medium text-slate-800 bg-white"
          >
            <option value="all">All Employees</option>
            <option value="usr_emp_001">John Doe (EMP001)</option>
            <option value="usr_emp_003">Alex Kumar (EMP002)</option>
            <option value="usr_emp_004">Priya Sharma (EMP003)</option>
          </select>
        </div>

        <button
          onClick={fetchReport}
          className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl transition-colors ml-auto cursor-pointer"
        >
          Apply Filters
        </button>
      </div>

      {/* 4 Stat Cards (Image 2: Sub-screen 7 reference) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reopened Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Reopened Tasks</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{summary.totalReopenedTasks}</p>
        </div>

        {/* Total Rework Hours */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Rework Hours</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{summary.totalReworkHours}</p>
        </div>

        {/* Total Rework Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Rework Cost</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">₹{summary.totalReworkCost.toLocaleString()}</p>
        </div>

        {/* Avg. Fix Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Avg. Fix Time</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{summary.avgFixTime}</p>
        </div>
      </div>

      {/* Two Charts Grid (Image 2: Sub-screen 7 reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rework Hours by Module */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Rework Hours by Module
            </h3>
            <p className="text-xs text-slate-400">Total corrective time recorded per software component</p>
          </div>

          <div className="h-52 flex items-end justify-around gap-4 pt-6 pb-2 px-2 border-b border-slate-200">
            {moduleBreakdown.map((m: any) => (
              <div key={m.module} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] font-bold text-blue-600">{m.hours}h</span>
                <div
                  className="w-10 bg-blue-500 rounded-t-lg transition-all"
                  style={{ height: `${(m.hours / 15) * 100}%` }}
                />
                <span className="text-[11px] font-semibold text-slate-700 truncate w-full text-center">
                  {m.module}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Defect Severity Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Defect Severity
            </h3>
            <p className="text-xs text-slate-400 mb-4">Severity distribution of defects</p>

            <div className="flex items-center justify-center p-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  {/* High (37%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeDasharray="37, 100"
                    strokeDashoffset="0"
                  />
                  {/* Medium (37%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeDasharray="37, 100"
                    strokeDashoffset="-37"
                  />
                  {/* Low (25%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray="26, 100"
                    strokeDashoffset="-74"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-800">8</span>
                  <span className="text-[9px] text-slate-400 block font-semibold">Total Bugs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-100">
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mr-1" />
              <span className="font-bold text-slate-800">High (3)</span>
              <span className="text-[10px] text-slate-400 block">37%</span>
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block mr-1" />
              <span className="font-bold text-slate-800">Med (3)</span>
              <span className="text-[10px] text-slate-400 block">37%</span>
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-1" />
              <span className="font-bold text-slate-800">Low (2)</span>
              <span className="text-[10px] text-slate-400 block">25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recurring Defects & Recent Activity (Image 2: Sub-screen 7 reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recurring Defects Table */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Recurring Defects</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-4">Module</th>
                <th className="py-2.5 px-4">Bug Count</th>
                <th className="py-2.5 px-4">Avg. Fix Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recurringDefects.map((r: any) => (
                <tr key={r.module} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{r.module}</td>
                  <td className="py-2.5 px-4 font-bold text-blue-600">{r.bugCount}</td>
                  <td className="py-2.5 px-4 text-slate-600">{r.avgFixTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Recent Activity</h3>
          <div className="space-y-3 text-xs">
            {recentActivity.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <span className="font-medium text-slate-400 text-[11px] shrink-0 w-24">{a.date}</span>
                <span className="font-semibold text-slate-800 truncate">{a.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
