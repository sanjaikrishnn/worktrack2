import React, { useState, useEffect } from 'react';
import { User, Task, BugReport } from '../types';
import {
  Users,
  CheckSquare,
  CheckCircle2,
  Bug,
  Clock,
  IndianRupee,
  ArrowRight,
  PlusCircle,
  RotateCcw,
  FileCheck,
} from 'lucide-react';
import { apiGetUsers, apiGetManagerSalarySummary } from '../services/api';

interface ManagerDashboardProps {
  user: User;
  tasks: Task[];
  bugs: BugReport[];
  onNavigateTab: (tab: string) => void;
  onOpenBug: (bugId: string) => void;
  onOpenCreateTask?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  tasks,
  bugs,
  onNavigateTab,
  onOpenBug,
  onOpenCreateTask,
}) => {
  const [employeesList, setEmployeesList] = useState<User[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<{
    totalReworkHours: string;
    totalReworkCost: number;
    totalProposedDeductions: number;
  }>({
    totalReworkHours: '0h 0m',
    totalReworkCost: 0,
    totalProposedDeductions: 0,
  });

  useEffect(() => {
    apiGetUsers()
      .then((res) => {
        setEmployeesList(res.users.filter((u) => u.role === 'employee'));
      })
      .catch((err) => console.error('Failed to load employee list:', err));

    apiGetManagerSalarySummary()
      .then((res) => {
        if (res.totals) {
          setPayrollSummary({
            totalReworkHours: res.totals.totalReworkHours,
            totalReworkCost: res.totals.totalReworkCost,
            totalProposedDeductions: res.totals.totalProposedDeductions,
          });
        }
      })
      .catch((err) => console.error('Failed to load payroll summary:', err));
  }, []);

  // Compute live statistics directly from authoritative PostgreSQL records
  const totalEmployees = employeesList.length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const reopenedTasks = tasks.filter((t) => t.status === 'reopened').length;

  const pendingBugReviews = bugs.filter((b) => b.status === 'reported' || b.status === 'assigned').length;
  const pendingFixApprovals = bugs.filter((b) => b.status === 'ready_for_review').length;
  const readyForReviewBugs = bugs.filter((b) => b.status === 'ready_for_review');

  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Build real-time employee task progress
  const employeeProgressData = employeesList.map((emp) => {
    const empTasks = tasks.filter((t) => t.assignedToUserId === emp.id || t.originalDeliveryUserId === emp.id);
    const avgProgress = empTasks.length > 0
      ? Math.round(empTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / empTasks.length)
      : 0;

    let status = 'Clear';
    let statusColor = 'bg-slate-50 text-slate-700 border-slate-200';

    if (empTasks.some((t) => t.status === 'reopened')) {
      status = 'Defect Rework';
      statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (empTasks.some((t) => t.status === 'overdue')) {
      status = 'At Risk';
      statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (avgProgress === 100 && empTasks.length > 0) {
      status = 'Completed';
      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (empTasks.length > 0) {
      status = 'In Progress';
      statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
    }

    return {
      id: emp.id,
      name: emp.name,
      empId: emp.empId,
      department: emp.department,
      designation: emp.designation,
      taskCount: empTasks.length,
      progress: avgProgress,
      status,
      statusColor,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with prominent + Create Task CTA */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
              Manager Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
              PostgreSQL Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-normal">
            Quality control metrics, workforce allocations, defect triage, and authorized payroll adjustments.
          </p>
        </div>

        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="px-5 py-2.5 bg-corporate-gradient text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Task</span>
          </button>
        )}
      </div>

      {/* 8 Operational Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Total Employees</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033]">{totalEmployees}</p>
          <span className="text-[10px] text-teal-600 font-semibold mt-1 block">Full engineering roster</span>
        </div>

        {/* Active Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Active Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#172033]">{activeTasksCount}</p>
          <span className="text-[10px] text-blue-600 font-semibold mt-1 block">In progress & assigned</span>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Completed Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Verified deliverables</span>
        </div>

        {/* Reopened Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Reopened Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600">{reopenedTasks}</p>
          <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Defects identified by QA</span>
        </div>

        {/* Pending Bug Reviews */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Pending Bug Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendingBugReviews}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Triage queue</span>
        </div>

        {/* Pending Fix Approvals */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Pending Fix Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-sky-600">{pendingFixApprovals}</p>
          <span className="text-[10px] text-sky-700 font-semibold mt-1 block">Rework approval queue</span>
        </div>

        {/* Corrective Hours Awaiting */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Total Rework Hours</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12345A]">{payrollSummary.totalReworkHours}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Recorded on defects</span>
        </div>

        {/* Proposed Deductions Total */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#64748B]">Approved Deductions</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-800">₹{payrollSummary.totalProposedDeductions.toLocaleString()}</p>
          <span className="text-[10px] text-teal-700 font-semibold mt-1 block">Reviewed & approved</span>
        </div>
      </div>

      {/* Action Banner if there are fixes awaiting manager approval */}
      {readyForReviewBugs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Action Required: Fix Submissions Ready for Review
              </h4>
              <p className="text-xs text-blue-800 font-medium mt-0.5">
                {readyForReviewBugs.length} engineer {readyForReviewBugs.length === 1 ? 'fix is' : 'fixes are'} awaiting verification and payroll review.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('manager-progress')}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Review Fixes Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Employee Task-Progress Table & Project Quality Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Employee Task Progress Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#172033] text-base">Employee Task Progress</h3>
              <p className="text-xs text-[#64748B]">Real-time milestone completion & delivery confidence</p>
            </div>
            <button
              onClick={() => onNavigateTab('manager-tasks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              All Tasks
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Engineer</th>
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Milestone Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#172033]">
                {employeeProgressData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No employee records found in database.
                    </td>
                  </tr>
                ) : (
                  employeeProgressData.map((emp) => (
                    <tr key={emp.empId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#172033]">{emp.name}</td>
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{emp.empId}</td>
                      <td className="py-3.5 px-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                emp.progress === 100
                                  ? 'bg-[#0D9488]'
                                  : emp.progress > 40
                                  ? 'bg-[#2563EB]'
                                  : emp.progress === 20
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${emp.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-[#172033]">{emp.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${emp.statusColor}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onNavigateTab('manager-bugs')}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          Inspect
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Project Quality Overview & Circular Gauge */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#172033] text-base mb-1">Project Quality Overview</h3>
            <p className="text-xs text-[#64748B] mb-5">Sprint milestone health & defect recurrence</p>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-100 mb-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-teal-600"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-[#172033]">{completionPercentage}%</span>
                  <span className="text-[9px] text-[#64748B] block font-semibold">Done</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#172033] mt-2">Overall Tasks Delivered</p>
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Bug className="w-4 h-4 text-rose-500" />
                  Active Bugs in Triage:
                </span>
                <span className="font-bold text-[#172033]">{pendingBugReviews}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Total Rework Hours:
                </span>
                <span className="font-bold text-[#172033]">{payrollSummary.totalReworkHours}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[#64748B] font-medium flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-teal-600" />
                  Estimated Rework Cost:
                </span>
                <span className="font-bold text-teal-700">₹{payrollSummary.totalReworkCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigateTab('manager-bugs')}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Review & Assign Defects
            </button>
            <button
              onClick={() => onNavigateTab('manager-salary')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#172033] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Payroll Deductions Governance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
