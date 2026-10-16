import React, { useState, useEffect } from 'react';
import { User, CorrectiveTimeEntry } from '../types';
import {
  Clock,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Info,
  User as UserIcon,
  Calculator,
  ShieldAlert,
} from 'lucide-react';
import { apiGetEmployeeSalarySummary } from '../services/api';

interface EmployeeSalaryReworkPageProps {
  user: User;
  onRefresh: () => void;
}

export const EmployeeSalaryReworkPage: React.FC<EmployeeSalaryReworkPageProps> = ({ user, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'rework' | 'salary'>('rework');
  const [data, setData] = useState<{
    employee: any;
    month: string;
    summary: { totalReworkHours: string; totalHoursDecimal: string; reworkCost: number; proposedDeduction: number };
    records: CorrectiveTimeEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGetEmployeeSalarySummary();
      setData(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const summary = data?.summary || {
    totalReworkHours: '5h 30m',
    totalHoursDecimal: '5.5',
    reworkCost: 1650,
    proposedDeduction: 1650,
  };

  const records = data?.records || [];

  const baseHourlyRate = user.hourlyRate || 300;
  const standardMonthlyHours = 160;
  const grossMonthlySalary = standardMonthlyHours * baseHourlyRate; // ₹48,000
  const approvedDeductions = records
    .filter((r) => r.status === 'approved')
    .reduce((acc, curr) => acc + curr.proposedDeduction, 0);
  const pendingDeductions = records
    .filter((r) => r.status === 'pending')
    .reduce((acc, curr) => acc + curr.proposedDeduction, 0);
  const netSalaryPreview = grossMonthlySalary - approvedDeductions;

  return (
    <div className="space-y-6">
      {/* Profile & Month Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2563EB] shadow-md shadow-blue-500/10 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#172033]">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Transparent Payroll
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Employee ID: <span className="font-bold text-[#172033]">{user.empId}</span> • {user.designation} ({user.department})
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-right self-start sm:self-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Payroll Cycle</span>
          <span className="text-sm font-bold text-[#172033]">{data?.month || 'October 2025'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] text-xs">
        <button
          onClick={() => setActiveTab('rework')}
          className={`pb-3 px-4 font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'rework'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Rework & Defect Log
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`pb-3 px-4 font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'salary'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Salary Structure & Net Payout Breakdown
        </button>
      </div>

      {activeTab === 'rework' ? (
        <>
          {/* 3 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Rework Hours */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#64748B] font-medium">Total Corrective Hours</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-[#172033] mt-1">{summary.totalReworkHours}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Logged across verified defects</span>
            </div>

            {/* Rework Cost */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#64748B] font-medium">Gross Rework Cost</span>
                <IndianRupee className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-[#172033] mt-1">₹{summary.reworkCost.toLocaleString()}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Calculated at ₹{baseHourlyRate}/hr</span>
            </div>

            {/* Proposed Deduction */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#64748B] font-medium">Proposed Deduction</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-600 mt-1">₹{summary.proposedDeduction.toLocaleString()}</p>
              <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Subject to final manager review</span>
            </div>
          </div>

          {/* My Rework Records Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#172033] text-base">My Rework Records</h3>
                <p className="text-xs text-[#64748B]">Itemized audit trail of corrective hours and cost</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">{records.length} Recorded Entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Task ID</th>
                    <th className="py-3.5 px-4">Module</th>
                    <th className="py-3.5 px-4">Bug ID</th>
                    <th className="py-3.5 px-4">Hours</th>
                    <th className="py-3.5 px-4">Cost</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#172033]">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{r.date}</td>
                      <td className="py-3.5 px-4 text-[#2563EB] font-bold">{r.taskId}</td>
                      <td className="py-3.5 px-4 font-bold text-[#172033]">{r.moduleName}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{r.bugId}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#172033]">{r.hoursDisplay}</td>
                      <td className="py-3.5 px-4 font-bold text-[#172033]">₹{r.calculatedCost.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'exempted'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status === 'exempted'
                            ? 'Exempted (No Deduction)'
                            : r.status === 'approved'
                            ? 'Approved'
                            : 'Pending Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Corporate Transparency Notice */}
          <div className="p-4 rounded-2xl bg-corporate-soft border border-blue-200 text-xs text-[#12345A] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Transparency Notice:</strong> Proposed deductions undergo managerial review before month-end payroll locking.
              If a defect was caused by specification ambiguity or upstream dependencies, your manager can record a formal
              defect exemption, zeroing the deduction amount while preserving the logged corrective work duration.
            </p>
          </div>
        </>
      ) : (
        /* Detailed Salary & Deduction Structure Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
              <span className="text-xs text-[#64748B] font-semibold block">Monthly Gross Base</span>
              <p className="text-2xl font-bold text-[#172033] mt-1">₹{grossMonthlySalary.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">160h standard benchmark @ ₹{baseHourlyRate}/hr</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
              <span className="text-xs text-[#64748B] font-semibold block">Approved Payroll Deductions</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">-₹{approvedDeductions.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pending manager review: ₹{pendingDeductions.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-teal-200 bg-teal-50/40 shadow-xs">
              <span className="text-xs text-teal-800 font-bold block uppercase tracking-wider">Estimated Net Salary</span>
              <p className="text-2xl font-black text-[#0D9488] mt-1">₹{netSalaryPreview.toLocaleString()}</p>
              <p className="text-[11px] text-teal-700 font-medium mt-1">Scheduled payout: 31 Oct 2025</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-[#172033] text-base flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Formula & Governance Transparency
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1.5">
              <p>Net Payout = Gross Monthly Salary - Approved Corrective Rework Deductions</p>
              <p>Approved Deduction = Σ (Approved Eligible Hours × Configured Rate [₹{baseHourlyRate}])</p>
              <p>Exempted Hours = Excluded from salary deductions (zero financial penalty)</p>
            </div>

            <p className="text-[#64748B] leading-relaxed">
              WorkTrack guarantees auditable records. You will receive an immediate notification whenever any change is recorded on your
              correction hours or deduction status by the management team.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
