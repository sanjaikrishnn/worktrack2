import React, { useState } from 'react';
import { User, Task, BugReport } from '../types';
import {
  CheckCircle,
  Upload,
  FileText,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertOctagon,
  ChevronDown,
  Layers,
  Send,
  ExternalLink,
  History,
  Check,
  X,
} from 'lucide-react';
import { apiSubmitTaskWork, apiVerifyTask } from '../services/api';

interface TaskDetailsPageProps {
  user: User;
  task: Task | null;
  tasks?: Task[];
  history?: any[];
  onBack: () => void;
  onRefresh: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const TaskDetailsPage: React.FC<TaskDetailsPageProps> = ({
  user,
  task,
  tasks = [],
  history = [],
  onBack,
  onRefresh,
  onSelectTask,
}) => {
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('deliverable_v2.0.zip');
  const [submittingWork, setSubmittingWork] = useState(false);

  // QA Verification States
  const [verifying, setVerifying] = useState(false);
  const [showFailForm, setShowFailForm] = useState(false);
  const [defectReason, setDefectReason] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<'High' | 'Medium' | 'Low'>('High');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [evidenceName, setEvidenceName] = useState('qa_verification_defect.png');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!task) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#E2E8F0] text-center max-w-md mx-auto my-12">
        <p className="text-[#64748B] text-xs font-medium">Task not found or access restricted.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Employee Submits Deliverable
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingWork(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await apiSubmitTaskWork(task.id, {
        submissionNotes: notes,
        fileName: fileName,
      });
      setSuccessMsg(res.message);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit work.');
    } finally {
      setSubmittingWork(false);
    }
  };

  // Tester Clicks PASS
  const handlePassVerification = async () => {
    try {
      setVerifying(true);
      setErrorMsg('');
      setSuccessMsg('');
      setShowFailForm(false);

      const res = await apiVerifyTask(task.id, {
        result: 'PASS',
      });

      setSuccessMsg(res.message || 'QA Verification PASSED! Module deliverable verified and approved.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record PASS verification.');
    } finally {
      setVerifying(false);
    }
  };

  // Tester Clicks FAIL & Submits Defect Reason
  const handleFailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectReason.trim()) {
      setErrorMsg('A defect reason is required to fail QA verification.');
      return;
    }

    try {
      setVerifying(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await apiVerifyTask(task.id, {
        result: 'FAIL',
        defectReason: defectReason.trim(),
        defectDescription: defectDescription.trim() || defectReason.trim(),
        severity: defectSeverity,
        stepsToReproduce: stepsToReproduce.trim(),
        expectedResult: expectedResult.trim(),
        actualResult: actualResult.trim(),
        evidenceName: evidenceName,
      });

      setSuccessMsg(res.message || 'QA Verification FAILED. Defect logged and corrective workflow triggered.');
      setShowFailForm(false);
      setDefectReason('');
      setDefectDescription('');
      setStepsToReproduce('');
      setExpectedResult('');
      setActualResult('');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record FAIL verification.');
    } finally {
      setVerifying(false);
    }
  };

  const isPass = task.qaStatus === 'Pass';
  const isFail = task.qaStatus === 'Fail' || task.status === 'reopened';
  const isPending = !isPass && !isFail;

  return (
    <div className="space-y-6">
      {/* Navigation & Operational Task Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Quick Task Switcher if multiple tasks available */}
        {tasks.length > 0 && onSelectTask && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Select Task:</span>
            <select
              value={task.taskId}
              onChange={(e) => onSelectTask(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.taskId}>
                  {t.taskId} — {t.moduleName} {t.qaStatus ? `(${t.qaStatus})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header Banner: Assigned Operational Tasks */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
              Assigned Operational Task
            </span>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {task.taskId}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                task.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : task.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {task.status === 'in_progress' ? 'In Progress' : task.status}
            </span>

            {/* QA Status Badge */}
            {isPass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                QA: Pass
              </span>
            )}
            {isFail && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertOctagon className="w-3 h-3 text-rose-600" />
                QA: Fail
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-500" />
                QA: Pending
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
            {task.moduleName}
          </h1>
          <p className="text-xs text-[#64748B] mt-1.5 font-medium">
            Assigned Author:{' '}
            <span className="font-bold text-[#172033]">
              {task.assignedToName || task.originalDelivererName || 'John Doe'}
            </span>{' '}
            • Committed Deadline:{' '}
            <span className="font-bold text-rose-600">{task.deadline}</span>
            {task.submittedAt && (
              <span>
                {' '}
                • Delivered:{' '}
                <span className="font-bold text-slate-800">
                  {new Date(task.submittedAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}
          </p>
        </div>

        {/* QA Action Quick Indicators */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-medium text-[#64748B] block">Verification Status</span>
            <span
              className={`text-sm font-extrabold ${
                isPass ? 'text-emerald-600' : isFail ? 'text-rose-600' : 'text-amber-600'
              }`}
            >
              {isPass ? 'PASSED (Approved)' : isFail ? 'FAILED (Rework Required)' : 'Awaiting Inspection'}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Grid: Task Specification & Scope vs Delivery Package */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scope & Specification */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#172033] text-base">Operational Task Specification</h3>
              <span className="text-xs font-semibold text-slate-400">Core Requirements</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">Target Component:</span>
                <p className="text-[#172033] font-bold text-sm">{task.moduleName}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Functional Requirements & Deliverable Scope:</span>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-medium whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#64748B]">Completion Progress:</span>
                  <span className="font-bold text-[#2563EB]">{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      task.progress === 100 ? 'bg-emerald-500' : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deliverable Artifact Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-[#172033] text-base">Delivered Build Artifact</h3>
                <p className="text-xs text-[#64748B]">Package uploaded by developer for QA verification</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Release Candidate
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">{task.submissionFile || 'payment_gateway_v1.2.zip'}</p>
                  <p className="text-[11px] text-[#64748B]">
                    {task.submissionNotes || 'Work submitted for testing with integration test suite.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Downloading build artifact: ${task.submissionFile || 'payment_gateway_v1.2.zip'}`)}
                  className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-100 text-[#172033] font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                  Download Build
                </button>
              </div>
            </div>
          </div>

          {/* If Employee: Submit Work Form (when task is in progress, reopened, or pending QA) */}
          {user.role === 'employee' && task.qaStatus !== 'Pass' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
              <h3 className="font-bold text-[#172033] text-base mb-1">
                {task.qaStatus === 'Fail' || task.status === 'reopened'
                  ? 'Resend Deliverable for Tester Consideration'
                  : 'Submit Deliverable Build'}
              </h3>
              <p className="text-xs text-[#64748B] mb-5">
                {task.qaStatus === 'Fail' || task.status === 'reopened'
                  ? 'Upload revised release artifact after corrective bug fix. Submitting will notify the QA tester and resend for tester verification.'
                  : 'Upload revised release artifact or package for QA verification.'}
              </p>

              <form onSubmit={handleSubmitWork} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1.5">
                    Deliverable Archive (ZIP / TAR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                    className="block w-full text-xs text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#EFF6FF] file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer"
                  />
                  {fileName && (
                    <p className="text-[11px] text-[#64748B] mt-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                      Selected File: <span className="font-bold text-[#172033]">{fileName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#172033] mb-1.5">
                    Release Notes / Deployment Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Include database migration notes, API keys, or verification instructions..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingWork}
                  className="px-6 py-2.5 bg-corporate-gradient text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {submittingWork
                    ? 'Submitting Work...'
                    : task.qaStatus === 'Fail' || task.status === 'reopened'
                    ? 'Resend Deliverable for Tester Consideration'
                    : 'Submit Deliverable for QA'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Submission History & Audits */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-[#172033] text-base">Submission History</h3>
                <p className="text-xs text-[#64748B]">Audited deliverables & versions</p>
              </div>
              <History className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                  <span>{task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : '12 Oct 2025'}</span>
                  <span className="font-bold text-teal-700">{task.submissionFile || 'v1.3.zip'}</span>
                </div>
                <p className="text-xs font-bold text-[#172033]">Current Release Build</p>
                <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                  {task.submissionNotes || 'Integrated endpoint security headers and QA verification hooks.'}
                </p>
              </div>

              {history.map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[11px] text-[#2563EB] font-bold block mb-0.5">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                  <p className="text-xs text-[#172033] font-medium leading-relaxed">{h.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QA VERIFICATION RESULT SECTION (TESTER & MANAGEMENT ONLY - REMOVED FOR EMPLOYEE) */}
      {/* ========================================================================= */}
      {user.role !== 'employee' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#E2E8F0] shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#12345A] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
                <ShieldCheck className="w-6 h-6 text-teal-300 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#172033] tracking-tight">
                  QA Verification Result
                </h2>
                <p className="text-xs text-[#64748B] font-medium mt-0.5">
                  Record official quality assurance verdict. PASS marks deliverable certified; FAIL requires defect reason, creates defect bug, and triggers corrective rework.
                </p>
              </div>
            </div>

            {/* Current Verdict Badge */}
            <div className="shrink-0">
              {isPass && (
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  VERIFICATION: PASS
                </span>
              )}
              {isFail && (
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1.5 shadow-2xs">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  VERIFICATION: FAIL
                </span>
              )}
              {isPending && (
                <span className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  AWAITING QA VERIFICATION
                </span>
              )}
            </div>
          </div>

          {/* Existing Status Notice Box */}
          {isPass && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-900 text-sm">
                  Module Certified: QA Verification PASSED
                </p>
                <p className="text-emerald-800 leading-relaxed font-medium">
                  This operational task has been formally inspected and passed all acceptance tests. No open defects are linked.
                  {task.qaVerifiedAt && (
                    <span className="block mt-1 font-semibold text-emerald-700">
                      Inspected on: {new Date(task.qaVerifiedAt).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {isFail && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-extrabold text-rose-900 text-sm">
                  QA Verification FAILED — Corrective Workflow Active
                </p>
                <p className="text-rose-800 leading-relaxed font-medium">
                  Defect logged: <span className="font-bold underline">{task.qaDefectReason || 'Quality defects detected'}</span>. Task has been reopened for rework and assigned for corrective fix.
                  {task.qaVerifiedAt && (
                    <span className="block mt-1 font-semibold text-rose-700">
                      Inspected on: {new Date(task.qaVerifiedAt).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Controls: PASS and FAIL Options ONLY appear when awaiting QA verification */}
          {isPending ? (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#172033]">Execute QA Verification Decision:</p>
                  <p className="text-[11px] text-[#64748B]">
                    Click green PASS to approve, or red FAIL to log a defect reason and trigger corrective rework.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Green PASS button */}
                  <button
                    type="button"
                    onClick={handlePassVerification}
                    disabled={verifying}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm tracking-wide rounded-xl shadow-md shadow-emerald-700/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    {verifying ? 'SAVING...' : 'PASS'}
                  </button>

                  {/* Red FAIL button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowFailForm(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    disabled={verifying}
                    className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-sm tracking-wide rounded-xl shadow-md shadow-rose-700/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-5 h-5 stroke-[3]" />
                    FAIL
                  </button>
                </div>
              </div>

              {/* Expanded Defect Logging Form when FAIL is selected */}
              {showFailForm && (
                <div className="mt-4 pt-5 border-t border-slate-200 bg-white p-5 rounded-xl border border-rose-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <h4 className="font-extrabold text-xs tracking-tight">
                        Defect Reason Required For QA Failure
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFailForm(false)}
                      className="text-[#64748B] hover:text-[#172033] text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleFailVerificationSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#172033] mb-1">
                        Defect Reason / Defect Summary <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={defectReason}
                        onChange={(e) => setDefectReason(e.target.value)}
                        placeholder="e.g. Payment webhook callback fails on timeout and invalid currency parsing"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30 text-slate-900 font-semibold"
                      />
                      <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                        This reason will name the created bug and be presented on the Employee and Manager dashboards.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#172033] mb-1">
                          Defect Severity Rating <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={defectSeverity}
                          onChange={(e) => setDefectSeverity(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white text-slate-900 font-medium"
                        >
                          <option value="High">High Severity (Blocker / Critical)</option>
                          <option value="Medium">Medium Severity (Major Failure)</option>
                          <option value="Low">Low Severity (Minor Defect)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-[#172033] mb-1">
                          Evidence Screenshot Attachment
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setEvidenceName(e.target.files[0].name);
                            }
                          }}
                          className="block w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#172033] mb-1">
                        Detailed Failure Description & Symptoms <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={defectDescription}
                        onChange={(e) => setDefectDescription(e.target.value)}
                        placeholder="Describe how the deliverable failed verification specifications..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#172033] mb-1">Steps to Reproduce</label>
                      <textarea
                        rows={2}
                        value={stepsToReproduce}
                        onChange={(e) => setStepsToReproduce(e.target.value)}
                        placeholder="1. Launch deliverable build&#10;2. Trigger test payload&#10;3. Check error output"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-mono text-[11px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#172033] mb-1">Expected Result</label>
                        <input
                          type="text"
                          value={expectedResult}
                          onChange={(e) => setExpectedResult(e.target.value)}
                          placeholder="e.g. 200 OK webhook response with verified signature"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#172033] mb-1">Actual Result</label>
                        <input
                          type="text"
                          value={actualResult}
                          onChange={(e) => setActualResult(e.target.value)}
                          placeholder="e.g. 504 Gateway Timeout on callback receipt"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowFailForm(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-[#64748B] hover:text-[#172033]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={verifying}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-700/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        {verifying ? 'Logging Defect...' : 'Confirm QA Failure & Trigger Corrective Workflow'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Decision already made: options DO NOT appear until employee resends deliverable */
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isPass ? <CheckCircle2 className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">
                    {isPass
                      ? 'QA Verdict Completed: Passed & Released'
                      : 'QA Verdict Completed: Defect Logged & Reopened'}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {isPass
                      ? 'Deliverable successfully verified. Verification options are closed.'
                      : 'Decision options are closed and will reappear once the employee resends the revised deliverable for tester consideration.'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
                  isPass
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isPass ? 'Verified' : 'Awaiting Employee Resubmission'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
