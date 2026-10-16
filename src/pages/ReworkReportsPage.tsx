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

import { apiDownloadPayrollCsv } from '../services/api';

interface ReworkReportsPageProps {
  user: User;
  onNavigateTab: (tab: string) => void;
}

export const ReworkReportsPage: React.FC<ReworkReportsPageProps> = ({ user, onNavigateTab }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [csvNotice, setCsvNotice] = useState('');

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      setDownloadSuccess(false);
      setCsvNotice('');
      const res = await apiDownloadPayrollCsv('worktrack_rework_cost_report.csv');
      setDownloadSuccess(true);
      setCsvNotice(`Generated CSV report (${res.rowCount} rows)`);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.warn('Failed to export CSV from server, generating client-side export:', err);
      // Fallback
      const rows = [
        ['WorkTrack Rework Cost & Reports Summary'],
        ['Generated At', new Date().toLocaleString()],
        [],
        ['Employee', 'Task ID', 'Bug ID', 'Hours', 'Cost (INR)', 'Status'],
        ...reworkDetails.map((r) => [r.employee, r.taskId, r.bugId, r.hours, r.cost, r.status]),
      ];
      const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'worktrack_rework_cost_report.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 500);
      setDownloadSuccess(true);
      setCsvNotice('Generated CSV report (5 rows)');
      setTimeout(() => setDownloadSuccess(false), 4000);
    } finally {
      setDownloading(false);
    }
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
      <div className="bg-[#FAF6EF] rounded-2xl p-6 border-2 border-[#DCC7A1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#172033]">Rework Cost & Reports</h2>
          <p className="text-xs text-[#5C675E] mt-1 font-medium">
            Quality metrics, defect recurrence breakdown, and authorized payroll adjustments.
          </p>
          {csvNotice && (
            <p className="text-xs font-bold text-[#2E6B50] mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {csvNotice}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('manager-reports')}
            className="px-4 py-2.5 bg-[#FAF6EF] hover:bg-[#EFE5D3] text-[#2E6B50] border-2 border-[#2E6B50] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Detailed Analytics View
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="px-4 py-2.5 bg-[#2E6B50] hover:bg-[#23543E] text-white text-xs font-bold rounded-xl shadow-md shadow-[#2E6B50]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#DCC7A1]" />
            {downloadSuccess ? 'CSV Generated!' : downloading ? 'Generating...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Rework Hours */}
        <div className="bg-[#FAF6EF] rounded-2xl p-5 border border-[#DCC7A1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F2EC] text-[#2E6B50] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5C675E] font-medium">Total Rework Hours</p>
            <p className="text-2xl font-black text-[#172033] mt-0.5">18h</p>
          </div>
        </div>

        {/* Rework Cost */}
        <div className="bg-[#FAF6EF] rounded-2xl p-5 border border-[#DCC7A1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F2EC] text-[#2E6B50] flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5C675E] font-medium">Rework Cost</p>
            <p className="text-2xl font-black text-[#2E6B50] mt-0.5">₹5,400</p>
          </div>
        </div>

        {/* Payroll Adjustments */}
        <div className="bg-[#FAF6EF] rounded-2xl p-5 border border-[#DCC7A1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F2EC] text-[#2E6B50] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#5C675E] font-medium">Payroll Adjustments</p>
            <p className="text-2xl font-black text-[#2E6B50] mt-0.5">₹2,000</p>
          </div>
        </div>
      </div>

      {/* Rework Details Table (Screen 9 reference) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-[#172033] text-base">Rework Details</h3>
          <span className="text-xs text-[#5C675E] font-medium">Audited Deliverables</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5EFE3] border-b border-[#DCC7A1] text-[#5C675E] font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Bug ID</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCC7A1]/40 text-[#172033]">
              {reworkDetails.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#EFE5D3]/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#172033]">{row.employee}</td>
                  <td className="py-3 px-4 text-[#2E6B50] font-bold">{row.taskId}</td>
                  <td className="py-3 px-4 text-[#172033] font-medium">{row.bugId}</td>
                  <td className="py-3 px-4 font-semibold text-[#172033]">{row.hours}</td>
                  <td className="py-3 px-4 font-bold text-[#2E6B50]">{row.cost}</td>
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

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rework Hours by Employee Bar Chart */}
        <div className="lg:col-span-7 bg-[#FAF6EF] rounded-2xl p-6 border border-[#DCC7A1] shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-[#172033] text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#2E6B50]" />
              Rework Hours by Employee
            </h3>
            <p className="text-xs text-[#5C675E]">Total corrective time recorded per engineer</p>
          </div>

          <div className="h-48 flex items-end justify-around gap-6 pt-6 pb-2 px-4 border-b border-[#DCC7A1]">
            {/* John Doe */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-[#2E6B50]">5.5h</span>
              <div className="w-12 bg-[#2E6B50] rounded-t-lg transition-all" style={{ height: '55%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">John Doe</span>
            </div>

            {/* Alex Kumar */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-[#2E6B50]">8.2h</span>
              <div className="w-12 bg-[#23543E] rounded-t-lg transition-all" style={{ height: '75%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">Alex Kumar</span>
            </div>

            {/* Priya Sharma */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-[#2E6B50]">12.3h</span>
              <div className="w-12 bg-[#163A2B] rounded-t-lg transition-all" style={{ height: '95%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">Priya Sharma</span>
            </div>

            {/* Rahul Verma */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <span className="text-[11px] font-bold text-[#2E6B50]">6.7h</span>
              <div className="w-12 bg-[#3D8867] rounded-t-lg transition-all" style={{ height: '62%' }} />
              <span className="text-xs font-semibold text-slate-700 mt-1">Rahul Verma</span>
            </div>
          </div>
        </div>

        {/* Right: Recurring Defects Donut / Pie Chart */}
        <div className="lg:col-span-5 bg-[#FAF6EF] rounded-2xl p-6 border border-[#DCC7A1] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#172033] text-base mb-1 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#2E6B50]" />
              Recurring Defects
            </h3>
            <p className="text-xs text-[#5C675E] mb-4">Module failure distribution</p>

            <div className="flex items-center justify-center p-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EFE5D3" strokeWidth="4" />
                  {/* Login 40% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#2E6B50"
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
                    stroke="#163A2B"
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
                    stroke="#C6B086"
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
                    stroke="#DCC7A1"
                    strokeWidth="4"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-[#172033]">40%</span>
                  <span className="text-[10px] text-[#5C675E] block font-semibold">Login</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#DCC7A1]/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E6B50]" />
              <span className="text-[#5C675E]">Login (40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#163A2B]" />
              <span className="text-[#5C675E]">Payment (30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C6B086]" />
              <span className="text-[#5C675E]">Reporting (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DCC7A1]" />
              <span className="text-[#5C675E]">Others (10%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
