import React, { useState } from 'react';
import { User, BugReport, Task } from '../types';
import {
  Timer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  RotateCcw,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { apiReviewBug } from '../services/api';
import { RequestChangesModal } from '../components/RequestChangesModal';

interface ManagerProgressPageProps {
  user: User;
  bugs: BugReport[];
  tasks: Task[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ManagerProgressPage: React.FC<ManagerProgressPageProps> = ({
  user,
  bugs,
  tasks,
  onRefresh,
  onNavigateTab,
}) => {
  const [selectedBugId, setSelectedBugId] = useState<string>(
    bugs.find((b) => b.status === 'ready_for_review')?.bugId || bugs[0]?.bugId || 'BUG-001'
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);

  const selectedBug = bugs.find((b) => b.bugId === selectedBugId || b.id === selectedBugId) || bugs[0];

  const handleApproveFix = async () => {
    if (!selectedBug) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await apiReviewBug(selectedBug.id, {
        decision: 'approve',
        reviewNotes: 'Verified and approved. Reopened task can now be finalized and hours recorded.',
      });
      setSuccessMsg(res.message);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve fix.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async (comments: string) => {
    if (!selectedBug) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await apiReviewBug(selectedBug.id, {
        decision: 'request_changes',
        reviewNotes: comments,
      });
      setSuccessMsg(res.message);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request changes.');
    } finally {
      setLoading(false);
    }
  };

  const bugFixProgressList = [
    {
      bugId: 'BUG-001',
      taskId: 'T-002',
      employee: 'John Doe',
      progress: 60,
      fixingTime: '2h 20m',
      deadline: '15 Oct',
      status: 'In Progress',
    },
    {
      bugId: 'BUG-002',
      taskId: 'T-004',
      employee: 'Alex Kumar',
      progress: 30,
      fixingTime: '1h 10m',
      deadline: '18 Oct',
      status: 'In Progress',
    },
    {
      bugId: 'BUG-003',
      taskId: 'T-005',
      employee: 'Priya Sharma',
      progress: 100,
      fixingTime: '4h 50m',
      deadline: '15 Oct',
      status: 'Ready for Review',
    },
    {
      bugId: 'BUG-004',
      taskId: 'TASK-012',
      employee: 'John Doe',
      progress: 60,
      fixingTime: '2h 36m',
      deadline: '18 Oct',
      status: 'Ready for Review',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Timer className="w-6 h-6 text-blue-600" />
            Bug Fix Progress Monitoring & Approval
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track corrective time, verify deliverable files, and authorize closure.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('manager-reports')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          View Rework Reports
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

      {/* Main Grid: Bug Fix Progress Table & Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bug Fix Progress Table (Screen 8 reference) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">Bug Fix Progress</h3>
            <span className="text-xs text-slate-400 font-medium">Active Corrective Sessions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-3">Bug ID</th>
                  <th className="py-3 px-3">Task ID</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Fixing Time</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bugFixProgressList.map((row) => (
                  <tr
                    key={row.bugId}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedBug?.bugId === row.bugId ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => setSelectedBugId(row.bugId)}
                  >
                    <td className="py-3 px-3 font-bold text-blue-600">{row.bugId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{row.taskId}</td>
                    <td className="py-3 px-3 text-slate-600">{row.employee}</td>
                    <td className="py-3 px-3 w-28">
                      <div className="flex items-center gap-1.5">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              row.progress === 100
                                ? 'bg-emerald-500'
                                : row.progress > 40
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600">{row.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{row.fixingTime}</td>
                    <td className="py-3 px-3 text-slate-500">{row.deadline}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Ready for Review'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedBugId(row.bugId)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detailed View & Action Panel (Screen 8 reference) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">Detailed View</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                selectedBug?.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedBug?.status === 'ready_for_review'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {selectedBug?.status === 'ready_for_review' ? 'Ready for Review' : selectedBug?.status}
            </span>
          </div>

          {selectedBug && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold block">Bug ID</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedBug.bugId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Employee</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBug.assignedToName || 'John Doe (EMP001)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Assigned Date</span>
                  <span className="font-medium text-slate-700">15 Oct 2025</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Elapsed Corrective Time</span>
                  <span className="font-bold text-blue-600">
                    {selectedBug.bugId === 'BUG-003' ? '4h 50m' : '2h 20m'}
                  </span>
                </div>
              </div>

              {/* Fix Submission Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">Fix Submission</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">File:</span>
                  <span className="font-semibold text-blue-600 inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    fix_v1.1.zip
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500 block mb-0.5">Notes:</span>
                  <p className="text-slate-700 font-medium">Validation added for empty fields.</p>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Submitted: 15 Oct 2025, 4:30 PM
                </div>
              </div>

              {/* Review Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                <div className="flex gap-3">
                  <button
                    onClick={handleApproveFix}
                    disabled={loading || selectedBug.status === 'approved'}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    {selectedBug.status === 'approved' ? 'Fix Approved' : 'Approve Fix'}
                  </button>

                  <button
                    onClick={() => setShowRequestChangesModal(true)}
                    disabled={loading}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Changes
                  </button>
                </div>

                <button
                  onClick={() => onNavigateTab('manager-reports')}
                  className="w-full py-2.5 border border-[#E2E8F0] text-[#172033] hover:bg-slate-50 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-blue-600" />
                  View Related Payroll Reports
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRequestChangesModal && selectedBug && (
        <RequestChangesModal
          isOpen={showRequestChangesModal}
          bugId={selectedBug.bugId}
          onClose={() => setShowRequestChangesModal(false)}
          onSubmit={handleRequestChanges}
        />
      )}
    </div>
  );
};
