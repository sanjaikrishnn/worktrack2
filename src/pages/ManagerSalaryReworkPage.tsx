import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  Clock,
  IndianRupee,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { apiGetManagerSalarySummary, apiApproveDeduction } from '../services/api';
import { ExemptionModal } from '../components/ExemptionModal';

interface ManagerSalaryReworkPageProps {
  user: User;
  onRefresh: () => void;
}

export const ManagerSalaryReworkPage: React.FC<ManagerSalaryReworkPageProps> = ({ user, onRefresh }) => {
  const [selectedMonth, setSelectedMonth] = useState('October 2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [summaryData, setSummaryData] = useState<{
    month: string;
    totals: { totalReworkHours: string; totalHoursDecimal: string; totalReworkCost: number; totalProposedDeductions: number };
    employeeSummaries: any[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Exemption modal state
  const [exemptionTarget, setExemptionTarget] = useState<{ entryId: string; bugId: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await apiGetManagerSalarySummary();
      setSummaryData(res);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (entryId: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await apiApproveDeduction({ entryId, action });
      setSuccessMsg(res.message);
      await loadData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExemptionSubmit = async (reason: string) => {
    if (!exemptionTarget) return;
    try {
      setLoading(true);
      const res = await apiApproveDeduction({
        entryId: exemptionTarget.entryId,
        action: 'exempt',
        exemptionReason: reason,
      });
      setSuccessMsg(`Defect ${exemptionTarget.bugId} exempted from payroll deduction: "${reason}"`);
      setExemptionTarget(null);
      await loadData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to exempt defect.');
    } finally {
      setLoading(false);
    }
  };

  const totals = summaryData?.totals || {
    totalReworkHours: '42h 30m',
    totalHoursDecimal: '42.5',
    totalReworkCost: 12750,
    totalProposedDeductions: 12750,
  };

  const rawSummaries = summaryData?.employeeSummaries || [
    { id: 'usr_emp_001', empId: 'EMP001', name: 'John Doe', reworkHours: '5h 30m', reworkCost: 1650, proposedDeduction: 1650, status: 'Approved', records: [{ id: 'cte_001', bugId: 'BUG-004' }] },
    { id: 'usr_emp_003', empId: 'EMP002', name: 'Alex Kumar', reworkHours: '8h 15m', reworkCost: 2475, proposedDeduction: 2475, status: 'Pending', records: [{ id: 'cte_004', bugId: 'BUG-002' }] },
    { id: 'usr_emp_004', empId: 'EMP003', name: 'Priya Sharma', reworkHours: '12h 20m', reworkCost: 3700, proposedDeduction: 3700, status: 'Approved', records: [{ id: 'cte_005', bugId: 'BUG-003' }] },
    { id: 'usr_emp_005', empId: 'EMP004', name: 'Rahul Verma', reworkHours: '6h 45m', reworkCost: 2025, proposedDeduction: 2025, status: 'Pending', records: [{ id: 'cte_006', bugId: 'BUG-005' }] },
    { id: 'usr_emp_006', empId: 'EMP005', name: 'Neha Singh', reworkHours: '9h 40m', reworkCost: 2900, proposedDeduction: 2900, status: 'Approved', records: [{ id: 'cte_007', bugId: 'BUG-006' }] },
  ];

  const filteredSummaries = rawSummaries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Salary & Rework Details</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review employee-level corrective hours, approve proposed deductions, and record justified exemptions.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls Bar: Select Month & Search Employee (Image 2: Sub-screen 6 reference) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Select Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="October 2025">October 2025</option>
            <option value="September 2025">September 2025</option>
            <option value="August 2025">August 2025</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 3 Summary Cards (Image 2: Sub-screen 6 reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Rework Hours */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Rework Hours</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totals.totalReworkHours}</p>
        </div>

        {/* Total Rework Cost */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Rework Cost</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">₹{totals.totalReworkCost.toLocaleString()}</p>
        </div>

        {/* Total Proposed Deductions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Proposed Deductions</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{totals.totalProposedDeductions.toLocaleString()}</p>
        </div>
      </div>

      {/* Employee Rework Summary Table (Image 2: Sub-screen 6 reference) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Employee Rework Summary</h3>
          <span className="text-xs text-slate-400 font-medium">Monthly Payroll Deduction Authorizations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Rework Hours</th>
                <th className="py-3.5 px-4">Rework Cost</th>
                <th className="py-3.5 px-4">Deduction (Proposed)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSummaries.map((emp) => {
                const targetEntry = emp.records?.[0];
                return (
                  <tr key={emp.empId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600">{emp.empId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{emp.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{emp.reworkHours}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹{emp.reworkCost.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{emp.proposedDeduction.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : emp.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {targetEntry ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleAction(targetEntry.id, 'approve')}
                            title="Approve deduction"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setExemptionTarget({ entryId: targetEntry.id, bugId: targetEntry.bugId })}
                            title="Exempt defect"
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Clear</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {exemptionTarget && (
        <ExemptionModal
          isOpen={!!exemptionTarget}
          entryId={exemptionTarget.entryId}
          bugId={exemptionTarget.bugId}
          onClose={() => setExemptionTarget(null)}
          onSubmit={handleExemptionSubmit}
        />
      )}
    </div>
  );
};
