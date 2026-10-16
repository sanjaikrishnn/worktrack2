import React, { useState, useEffect } from 'react';
import { User, Task, BugReport } from '../types';
import { Bug, Calendar, UserCheck, AlertCircle, CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { apiAssignBug, apiGetUsers } from '../services/api';
import { ExemptionModal } from '../components/ExemptionModal';

interface BugReviewPageProps {
  user: User;
  bugs: BugReport[];
  tasks: Task[];
  initialBugId?: string;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const BugReviewPage: React.FC<BugReviewPageProps> = ({
  user,
  bugs,
  tasks,
  initialBugId,
  onRefresh,
  onNavigateTab,
}) => {
  const [selectedBugId, setSelectedBugId] = useState<string>(initialBugId || bugs[0]?.bugId || 'BUG-001');
  const [employees, setEmployees] = useState<User[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('2025-10-18');
  const [notes, setNotes] = useState<string>('Please fix the validation issue.');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showExemptionModal, setShowExemptionModal] = useState<boolean>(false);

  useEffect(() => {
    apiGetUsers().then((res) => {
      const emps = res.users.filter((u) => u.role === 'employee');
      setEmployees(emps);
      if (emps.length > 0 && !assignedUserId) {
        setAssignedUserId(emps[0].id);
      }
    });
  }, []);

  const currentBug = bugs.find((b) => b.bugId === selectedBugId || b.id === selectedBugId) || bugs[0];

  useEffect(() => {
    if (currentBug) {
      if (currentBug.assignedToUserId) {
        setAssignedUserId(currentBug.assignedToUserId);
      }
      if (currentBug.correctionDeadline) {
        setDeadline(currentBug.correctionDeadline);
      }
      if (currentBug.managerNotes) {
        setNotes(currentBug.managerNotes);
      }
    }
  }, [currentBug?.id, currentBug?.bugId]);

  if (!currentBug) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Bug className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">No bug reports available for review.</p>
      </div>
    );
  }

  const linkedTask = tasks.find((t) => t.id === currentBug.taskId || t.taskId === currentBug.taskId);

  const handleAssignAndApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedUserId || !deadline) {
      setErrorMsg('Please select an assignee and correction deadline.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await apiAssignBug(currentBug.id, {
        assignedToUserId: assignedUserId,
        correctionDeadline: deadline,
        managerNotes: notes,
      });

      setSuccessMsg(res.message);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign bug.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bug Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-rose-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Defect:</span>
          <select
            value={currentBug.bugId}
            onChange={(e) => {
              setSelectedBugId(e.target.value);
              setSuccessMsg('');
            }}
            className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {bugs.map((b) => (
              <option key={b.id} value={b.bugId}>
                {b.bugId} - {b.title} ({b.severity}) [{b.status}]
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onNavigateTab('manager-progress')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View Bug Fix Progress
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
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

      {/* Main Two-Panel Layout (Screen 6 reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bug Details (From Tester) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Bug Details (From Tester)</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentBug.severity === 'High'
                  ? 'bg-rose-100 text-rose-700'
                  : currentBug.severity === 'Medium'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {currentBug.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Bug ID:</span>
              <span className="font-bold text-slate-800 text-sm">{currentBug.bugId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Task ID:</span>
              <span className="font-semibold text-blue-600">
                {linkedTask ? linkedTask.taskId : currentBug.taskId} ({currentBug.moduleName})
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Original Delivering Employee:</span>
              <span className="font-semibold text-slate-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200 inline-block mt-0.5">
                {currentBug.originalDelivererName || 'John Doe (EMP001)'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Current Defect Status:</span>
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                {currentBug.status}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-3 pt-2">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Description:</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                {currentBug.description}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Steps to Reproduce:</span>
              <pre className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {currentBug.stepsToReproduce || '1. Open login page\n2. Enter invalid credentials\n3. Click login'}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Expected Result:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {currentBug.expectedResult || 'Error message displayed'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Actual Result:</span>
                <p className="text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100 font-medium">
                  {currentBug.actualResult || 'Login successful'}
                </p>
              </div>
            </div>

            {/* Evidence attachment mockup */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Evidence:</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span className="font-medium text-slate-700">error-screenshot.png (2.4 MB)</span>
                </div>
                <span className="text-[11px] text-blue-600 font-semibold">Attached</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
              <span>Tester: {currentBug.reportedByName || 'Sarah Tester (TST001)'}</span>
              <span>Reported: 11 Oct 2025</span>
            </div>
          </div>
        </div>

        {/* Right Column: Assign to Employee Form (Screen 6 reference) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Assign to Employee</h3>
            <p className="text-xs text-slate-500">Allocate defect correction and set deadline.</p>
          </div>

          <form onSubmit={handleAssignAndApprove} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Employee *</label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.empId}) - {emp.designation}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Original delivering author remains tracked separately for audit and payroll records.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Correction Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Link to Original Task</label>
              <input
                type="text"
                readOnly
                value={`${linkedTask ? linkedTask.taskId : currentBug.taskId} - ${currentBug.moduleName}`}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Manager Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please fix the validation issue as discussed..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-corporate-gradient text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                {loading ? 'Assigning...' : 'Assign & Approve Work'}
              </button>

              <button
                type="button"
                onClick={() => setShowExemptionModal(true)}
                className="py-3 px-4 border border-teal-300 text-teal-800 bg-teal-50/50 hover:bg-teal-100 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-teal-700" />
                Exempt Defect
              </button>
            </div>
          </form>
        </div>
      </div>

      {showExemptionModal && (
        <ExemptionModal
          isOpen={showExemptionModal}
          entryId={currentBug.id}
          bugId={currentBug.bugId}
          onClose={() => setShowExemptionModal(false)}
          onSubmit={async (reason) => {
            setSuccessMsg(`Defect ${currentBug.bugId} exempted from employee deduction: "${reason}"`);
            setShowExemptionModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
