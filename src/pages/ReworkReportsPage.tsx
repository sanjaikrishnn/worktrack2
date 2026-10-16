import React, { useState } from 'react';
import { User, CorrectiveTimeEntry } from '../types';
import {
  Clock,
  IndianRupee,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  BarChart2,
} from 'lucide-react';

interface ReworkReportsPageProps {
  user: User;
  onNavigateTab: (tab: string) => void;
}

export const ReworkReportsPage: React.FC<ReworkReportsPageProps> = ({ user, onNavigateTab }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadCsv = () => {
    setDownloading(true);
    window.location.href = '/api/payroll/export-csv';
    setTimeout(() => setDownloading(false), 1500);
  };

  const reworkDetails = [
    { employee: 'John Doe', taskId: 'T-002', bugId: 'BUG-001', hours: '3h', cost: '₹900', status: 'Approved' },
    { employee: 'Alex Kumar', taskId: 'T-004', bugId: 'BUG-002', hours: '2h', cost: '₹1,300', status: 'Approved' },
    { employee: 'Priya Sharma', taskId: 'T-005', bugId: 'BUG-003', hours: '5h', cost: '₹1,300', status: 'Pending' },
    { employee: 'John Doe', taskId: 'TASK-012', bugId: 'BUG-004', hours: '2h 36m', cost: '₹780', status: 'Approved' },
    { employee: 'Rahul Verma', taskId: 'T-006', bugId: 'BUG-005', hours: '6h 45m', cost: '₹2,025', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rework Cost & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Quality metrics, defect recurrence breakdown, and authorized payroll adjustments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('manager-reports')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Detailed Analytics View
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* 3 Stat Cards (Screen 9 reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Rework Hours */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Rework Hours</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">18h</p>
          </div>
        </div>

        {/* Rework Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Rework Cost</p>
            <p className="text-2xl font-bold text-sky-600 mt-0.5">₹5,400</p>
          </div>
        </div>

        {/* Payroll Adjustments */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Payroll Adjustments</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">₹2,000</p>
          </div>
        </div>
      </div>

      {/* Rework Details Table (Screen 9 reference) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Rework Details</h3>
          <span className="text-xs text-slate-400 font-medium">Audited Deliverables</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Bug ID</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reworkDetails.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.employee}</td>
                  <td className="py-3 px-4 text-blue-600 font-medium">{row.taskId}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{row.bugId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.hours}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{row.cost}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Charts (Screen 9 reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rework Hours by Employee Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              Rework Hours by Employee
            </h3>
            <p className="text-xs text-slate-400">Total corrective time recorded per engineer</p>
          </div>

          <div className="h-48 flex items-end justify-around gap-6 pt-6 pb-2 px-4 border-b border-slate-200">
            {/* John Doe */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-blue-600">5.5h</span>
              <div className="w-12 bg-blue-500 rounded-t-lg transition-all" style={{ height: '55%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">John Doe</span>
            </div>

            {/* Alex Kumar */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-blue-600">8.2h</span>
              <div className="w-12 bg-blue-600 rounded-t-lg transition-all" style={{ height: '75%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">Alex Kumar</span>
            </div>

            {/* Priya Sharma */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-blue-600">12.3h</span>
              <div className="w-12 bg-indigo-600 rounded-t-lg transition-all" style={{ height: '95%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">Priya Sharma</span>
            </div>

            {/* Rahul Verma */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-blue-600">6.7h</span>
              <div className="w-12 bg-sky-500 rounded-t-lg transition-all" style={{ height: '62%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">Rahul Verma</span>
            </div>
          </div>
        </div>

        {/* Right: Recurring Defects Donut / Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-1 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Recurring Defects
            </h3>
            <p className="text-xs text-slate-400 mb-4">Module failure distribution</p>

            <div className="flex items-center justify-center p-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  {/* Login 40% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeDasharray="40, 100"
                    strokeDashoffset="0"
                  />
                  {/* Payment 30% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="4"
                    strokeDasharray="30, 100"
                    strokeDashoffset="-40"
                  />
                  {/* Reporting 20% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-70"
                  />
                  {/* Others 10% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-800">40%</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">Login</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-600">Login (40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span className="text-slate-600">Payment (30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Reporting (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Others (10%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
