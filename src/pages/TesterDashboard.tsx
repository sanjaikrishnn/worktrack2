import React, { useState } from 'react';
import { User, Task, BugReport } from '../types';
import {
  Layers,
  CheckCircle2,
  Bug,
  Upload,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  ShieldCheck,
  Search,
  AlertOctagon,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { apiReportBug } from '../services/api';

interface TesterDashboardProps {
  user: User;
  tasks: Task[];
  bugs: BugReport[];
  onRefresh: () => void;
  onOpenTask: (taskId: string) => void;
}

export const TesterDashboard: React.FC<TesterDashboardProps> = ({
  user,
  tasks,
  bugs,
  onRefresh,
  onOpenTask,
}) => {
  const [bugTitle, setBugTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(tasks[0]?.taskId || '');
  const [moduleName, setModuleName] = useState(tasks[0]?.moduleName || '');
  const [severity, setSeverity] = useState<'High' | 'Medium' | 'Low'>('High');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [evidenceName, setEvidenceName] = useState('defect-evidence.png');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all');

  // Real database metrics
  const totalModules = tasks.length;
  const passedCount = tasks.filter((t) => t.qaStatus === 'Pass').length;
  const failedCount = tasks.filter((t) => t.qaStatus === 'Fail' || t.status === 'reopened').length;
  const bugsFoundCount = bugs.length;

  const handleTaskChange = (taskId: string) => {
    setSelectedTask(taskId);
    const matched = tasks.find((t) => t.taskId === taskId || t.id === taskId);
    if (matched) {
      setModuleName(matched.moduleName);
    }
  };

  const handleSubmitBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !description.trim()) {
      setErrorMsg('Please provide a title and detailed description.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const matchedTask = tasks.find((t) => t.taskId === selectedTask || t.id === selectedTask);

      const res = await apiReportBug({
        title: bugTitle.trim(),
        description: description.trim(),
        stepsToReproduce: steps.trim(),
        expectedResult: expected.trim(),
        actualResult: actual.trim(),
        severity,
        taskId: matchedTask ? matchedTask.id : selectedTask,
        moduleName: moduleName || (matchedTask ? matchedTask.moduleName : 'General'),
        hasEvidence: !!evidenceName,
      });

      setSuccessMsg(`Defect ${res.bug.bugId} recorded! Manager alerted for assignment and task reopened.`);
      setBugTitle('');
      setDescription('');
      setSteps('');
      setExpected('');
      setActual('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to report bug.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'pass') return t.qaStatus === 'Pass';
    if (statusFilter === 'fail') return t.qaStatus === 'Fail' || t.status === 'reopened';
    if (statusFilter === 'pending') return !t.qaStatus || t.qaStatus === 'Pending';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[11px] font-bold border border-blue-200">
              QA Verification & Quality Control
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
            QA Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
            Inspect delivered operational tasks, record Pass/Fail verification verdicts, and trigger corrective workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-[#172033] rounded-xl transition-colors cursor-pointer"
          >
            Refresh Pipeline
          </button>
        </div>
      </div>

      {/* 3 Real Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Modules */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Total Testable Modules</p>
            <p className="text-2xl font-bold text-[#172033] mt-0.5">{totalModules}</p>
          </div>
        </div>

        {/* Tested Modules (Pass) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Verified & Passed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{passedCount}</p>
          </div>
        </div>

        {/* Bugs Found (Defects / Fail) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Bug className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Defects Identified</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{bugsFoundCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Submitted Modules Table & Create Bug Report Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submitted Modules Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#172033] text-base">Submitted Modules</h3>
              <p className="text-xs text-[#64748B]">Active QA verification pipeline and inspection records</p>
            </div>
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-[#172033] shadow-xs' : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setStatusFilter('pass')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'pass' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'text-[#64748B] hover:text-emerald-700'
                }`}
              >
                Pass ({passedCount})
              </button>
              <button
                onClick={() => setStatusFilter('fail')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'fail' ? 'bg-rose-100 text-rose-800 shadow-xs' : 'text-[#64748B] hover:text-rose-700'
                }`}
              >
                Fail ({failedCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">QA Status</th>
                  <th className="py-3 px-4">Tested On</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#172033]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#64748B]">
                      No modules found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const isPass = t.qaStatus === 'Pass';
                    const isFail = t.qaStatus === 'Fail' || t.status === 'reopened';
                    const isPending = !isPass && !isFail;

                    // Format tested date
                    let dateDisplay = 'Pending';
                    if (t.qaVerifiedAt) {
                      dateDisplay = new Date(t.qaVerifiedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                      });
                    } else if (t.submittedAt) {
                      dateDisplay = new Date(t.submittedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                      });
                    } else if (t.deadline) {
                      dateDisplay = new Date(t.deadline).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                      });
                    }

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#172033]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#172033] hover:text-[#2563EB] transition-colors cursor-pointer" onClick={() => onOpenTask(t.taskId)}>
                              {t.moduleName}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono">{t.taskId}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] font-medium">
                          {t.assignedToName || t.originalDelivererName || 'John Doe'}
                        </td>
                        <td className="py-3.5 px-4">
                          {/* Pass/Fail status badges */}
                          {isPass && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              Pass
                            </span>
                          )}
                          {isFail && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertOctagon className="w-3 h-3 text-rose-600 shrink-0" />
                              Fail
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] font-medium">{dateDisplay}</td>
                        <td className="py-3.5 px-4 text-right">
                          {/* Inspected button: white background, blue border and text */}
                          <button
                            onClick={() => onOpenTask(t.taskId)}
                            className="bg-white border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 font-bold px-3 py-1 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1"
                            title={`Inspect ${t.taskId} - ${t.moduleName}`}
                          >
                            Inspected
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Showing {filteredTasks.length} real operational deliverables</span>
            <span className="font-semibold text-teal-700">Database Synced</span>
          </div>
        </div>

        {/* Right Column: Create Bug Report Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#172033] text-base">Submit New Defect Report</h3>
          </div>
          <p className="text-xs text-[#64748B] mb-5">
            Logs reproducible defect, automatically reopens affected task, and preserves delivering author.
          </p>

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitBug} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#172033] mb-1">
                Bug Summary / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                placeholder="e.g. Login validation failure on special characters"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">
                  Affected Task <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => handleTaskChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 font-medium"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.taskId}>
                      {t.taskId} — {t.moduleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Severity Rating</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 font-medium"
                >
                  <option value="High">High Severity (Blocker)</option>
                  <option value="Medium">Medium Severity (Major)</option>
                  <option value="Low">Low Severity (Minor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1">
                Defect Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the failure mode and symptoms in detail..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1">Steps to Reproduce</label>
              <textarea
                rows={2}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="1. Enter valid username&#10;2. Enter password with special symbols&#10;3. Click login"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Expected Result</label>
                <input
                  type="text"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  placeholder="e.g. Validation error displayed"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Actual Result</label>
                <input
                  type="text"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="e.g. Uncaught 500 error"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1">Evidence / Screenshot Attachment</label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEvidenceName(e.target.files[0].name);
                  }
                }}
                className="block w-full text-xs text-[#64748B] file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-corporate-gradient text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting Defect...' : 'Submit Defect to Manager'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
