import React from 'react';
import { User, Task, BugReport } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Bug,
  ExternalLink,
  Timer,
  Layers,
} from 'lucide-react';

interface EmployeeDashboardProps {
  user: User;
  tasks: Task[];
  bugs: BugReport[];
  onOpenTask: (taskId: string) => void;
  onOpenBug: (bugId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  user,
  tasks,
  bugs,
  onOpenTask,
  onOpenBug,
  onNavigateTab,
}) => {
  // Scoped strictly to logged-in user
  const userTasks = tasks.filter((t) => t.assignedToUserId === user.id || t.originalDeliveryUserId === user.id);
  const userBugs = bugs.filter((b) => b.assignedToUserId === user.id);

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = userTasks.filter((t) => t.status === 'in_progress' || t.status === 'reopened').length;
  const overdueTasks = userTasks.filter(
    (t) => t.status === 'overdue' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date())
  ).length;

  const activeBugs = userBugs.filter((b) => b.status !== 'approved' && b.status !== 'rejected');
  const upcomingDeadlines = userTasks
    .filter((t) => t.status !== 'completed' && t.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Corporate Signature Soft Gradient */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={user.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2563EB] shadow-md shadow-blue-500/10 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                Hello, {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Active Session
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              Employee ID: <span className="font-bold text-[#172033]">{user.empId}</span> •{' '}
              <span className="text-[#172033]">{user.designation}</span> ({user.department})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('salary-rework')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#172033] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              My Salary & Deductions
            </button>
          )}
        </div>
      </div>

      {/* Rework Alert Banner if employee has active assigned defects */}
      {activeBugs.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Priority Corrective Maintenance Required
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {activeBugs.length} Active {activeBugs.length === 1 ? 'Defect' : 'Defects'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                {activeBugs[0].bugId}: {activeBugs[0].title}
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">
                Module: <span className="font-medium text-slate-900">{activeBugs[0].moduleName}</span> • Deadline:{' '}
                <span className="font-bold text-rose-600">{activeBugs[0].correctionDeadline || 'Immediate'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenBug(activeBugs[0].bugId)}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Launch Rework Module
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Assigned Tasks</p>
            <p className="text-2xl font-bold text-[#172033] mt-0.5">{totalTasks}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedTasks}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">In Progress</p>
            <p className="text-2xl font-bold text-[#2563EB] mt-0.5">{inProgressTasks}</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Overdue</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{overdueTasks}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: My Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Tasks Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#172033] text-base">Assigned Operational Tasks</h3>
              <p className="text-xs text-[#64748B]">Click any task to inspect details or submit deliverables</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{userTasks.length} Assigned</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#172033]">
                {userTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No tasks assigned yet.
                    </td>
                  </tr>
                ) : (
                  userTasks.map((t) => {
                    const isReopened = t.status === 'reopened';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{t.taskId}</td>
                        <td className="py-3.5 px-4 font-semibold text-[#172033]">
                          <span className="block">{t.title}</span>
                          <span className="text-[10px] text-slate-400">{t.moduleName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isReopened
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isReopened ? 'Corrective Rework' : 'Standard Dev'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] font-medium">{t.deadline || 'No deadline'}</td>
                        <td className="py-3.5 px-4 w-32">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  t.progress === 100
                                    ? 'bg-[#0D9488]'
                                    : t.progress > 40
                                    ? 'bg-[#2563EB]'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${t.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-[#172033]">{t.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                t.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : t.status === 'reopened'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.status === 'in_progress'
                                ? 'In Progress'
                                : t.status === 'reopened'
                                ? 'Reopened'
                                : t.status}
                            </span>
                          </div>
                          {t.qaStatus && (
                            <div>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1 ${
                                  t.qaStatus === 'Pass'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : t.qaStatus === 'Fail'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                QA: {t.qaStatus}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onOpenTask(t.taskId)}
                            className="text-[#2563EB] hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Active Rework Queue */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5">
            <h3 className="font-bold text-[#172033] text-base mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              Upcoming Deadlines
            </h3>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((t) => {
                  const daysRemaining = Math.ceil(
                    (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysRemaining <= 1;

                  return (
                    <div
                      key={t.id}
                      onClick={() => onOpenTask(t.taskId)}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <span className={`text-xs font-bold ${isUrgent ? 'text-rose-600' : 'text-blue-600'} block`}>
                          {t.taskId} • {daysRemaining < 0 ? 'Overdue' : daysRemaining === 0 ? 'Today' : `${daysRemaining}d Remaining`}
                        </span>
                        <span className="text-xs font-semibold text-[#172033] line-clamp-1">{t.title}</span>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">{t.deadline}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isUrgent ? 'Urgent' : 'Scheduled'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Rework Hours & Payroll Impact Preview */}
          <div className="bg-corporate-soft rounded-2xl border border-blue-200/70 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-teal-700" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#12345A]">Rework Impact Summary</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Corrective hours logged on defects are reviewed for fair company exemptions before payroll finalization.
            </p>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('salary-rework')}
                className="w-full py-2 bg-white hover:bg-slate-50 text-[#2563EB] font-bold text-xs rounded-xl border border-blue-200 shadow-2xs transition-colors cursor-pointer"
              >
                Inspect Personal Salary Breakdown
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
