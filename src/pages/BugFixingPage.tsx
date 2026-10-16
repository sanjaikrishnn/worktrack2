import React, { useState, useEffect } from 'react';
import { User, BugReport, Task } from '../types';
import {
  Bug,
  Lock,
  Clock,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  apiGetReworkSession,
  apiStartTimer,
  apiPauseTimer,
  apiSubmitFix,
} from '../services/api';
import { AuthModal } from '../components/AuthModal';

interface BugFixingPageProps {
  user: User;
  bugs: BugReport[];
  tasks: Task[];
  initialBugId?: string;
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const BugFixingPage: React.FC<BugFixingPageProps> = ({
  user,
  bugs,
  tasks,
  initialBugId,
  onRefresh,
  onNavigateTab,
}) => {
  // Find bug assigned to this employee (prefer BUG-004 or initialBugId)
  const userBugs = bugs.filter((b) => b.assignedToUserId === user.id || user.role === 'manager' || user.role === 'admin');
  const defaultBug =
    userBugs.find((b) => b.bugId === (initialBugId || 'BUG-004')) ||
    userBugs[0] ||
    bugs.find((b) => b.bugId === 'BUG-004') ||
    bugs[0];

  const [selectedBugId, setSelectedBugId] = useState<string>(defaultBug?.bugId || 'BUG-004');
  const [currentBug, setCurrentBug] = useState<BugReport | undefined>(defaultBug);

  // States for authentication and rework access
  const [isAuthenticatedForRework, setIsAuthenticatedForRework] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Timer states - strictly starts from 0hr : 0sec
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // 0hr : 0sec
  const [startedAtStr, setStartedAtStr] = useState(
    new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  );

  // Fix form
  const [fixDescription, setFixDescription] = useState(
    'Added validation for special characters in password field and updated backend logic.'
  );
  const [progressPercentage, setProgressPercentage] = useState(60);
  const [fixStatus, setFixStatus] = useState('In Progress');
  const [fixFile, setFixFile] = useState('fix_v1.1.zip');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation screen state
  const [confirmationData, setConfirmationData] = useState<{
    bugId: string;
    taskId: string;
    timeSpent: string;
    submissionDate: string;
    status: string;
  } | null>(null);

  // Active tab on bug details: "Bug Details" or "Comments"
  const [detailTab, setDetailTab] = useState<'details' | 'comments'>('details');

  useEffect(() => {
    const bug = bugs.find((b) => b.bugId === selectedBugId || b.id === selectedBugId);
    if (bug) {
      setCurrentBug(bug);
    }
  }, [selectedBugId, bugs]);

  // When current bug changes or component mounts, reset authentication and prompt for password
  useEffect(() => {
    setIsAuthenticatedForRework(false);
    setIsRunning(false);
    setElapsedSeconds(0);
    setShowAuthModal(true);
  }, [currentBug?.bugId]);

  // Live timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && isAuthenticatedForRework) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isAuthenticatedForRework]);

  const formatTimerDigital = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatTimerHuman = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const s = totalSecs % 60;
    return `${h}hr : ${s}sec`;
  };

  const handleOpenReworkModule = () => {
    setShowAuthModal(true);
  };

  // Triggered when employee successfully authenticates via AuthModal
  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    setIsAuthenticatedForRework(true);
    setElapsedSeconds(0); // Starts fresh from 0hr : 0sec
    setIsRunning(true);
    const nowStr = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
    setStartedAtStr(nowStr);

    if (currentBug) {
      try {
        // Authoritatively start/reset timer on server to 0 accumulated seconds
        await apiStartTimer(currentBug.bugId, true);
      } catch (err) {
        console.error('Failed to start timer on backend:', err);
      }
    }
  };

  const handleToggleTimer = async () => {
    if (!currentBug || !isAuthenticatedForRework) return;
    try {
      if (isRunning) {
        await apiPauseTimer(currentBug.bugId);
        setIsRunning(false);
      } else {
        await apiStartTimer(currentBug.bugId, false);
        setIsRunning(true);
      }
    } catch (err: any) {
      setIsRunning(!isRunning);
    }
  };

  const handleSubmitFix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBug) return;

    if (!fixDescription.trim()) {
      setErrorMsg('Fix description is required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await apiSubmitFix({
        bugId: currentBug.bugId,
        fixDescription,
        progressPercentage,
        fixFile,
        notes: `Fix submitted with progress ${progressPercentage}%. Status: ${fixStatus}`,
      });

      setIsRunning(false);
      setConfirmationData(res.confirmation);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit fix.');
    } finally {
      setLoading(false);
    }
  };

  // If fix submission was successful, render Screen 4: Submission Confirmation!
  if (confirmationData) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[2.3]" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Fix Submitted Successfully!</h2>
          <p className="text-sm text-slate-500 mt-2 mb-8">
            Your correction has been submitted to the manager for review.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Bug ID</span>
                <span className="font-bold text-slate-800 text-sm">{confirmationData.bugId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Task ID</span>
                <span className="font-semibold text-blue-600 text-sm">{confirmationData.taskId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Time Spent</span>
                <span className="font-bold text-slate-800">{confirmationData.timeSpent}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Submission Date</span>
                <span className="font-medium text-slate-700">{confirmationData.submissionDate}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Status</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {confirmationData.status}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5 text-left mb-6">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <span>
              Timer will stop automatically when you submit the fix. Your rework hours have been recorded for payroll
              review.
            </span>
          </div>

          <button
            onClick={() => {
              setConfirmationData(null);
              setIsAuthenticatedForRework(false);
              onNavigateTab('dashboard');
            }}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentBug) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Bug className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">No bug assigned to fix.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Defect switcher */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Corrective Workflow</span>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Bug Fixing: {currentBug.bugId}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 font-medium">Assigned Defect:</label>
          <select
            value={currentBug.bugId}
            onChange={(e) => {
              setSelectedBugId(e.target.value);
              setIsAuthenticatedForRework(false);
              setIsRunning(false);
              setElapsedSeconds(0);
              setShowAuthModal(true);
            }}
            className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {userBugs.map((b) => (
              <option key={b.id} value={b.bugId}>
                {b.bugId} - {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screen 3: Persistent Timer Banner */}
      {isAuthenticatedForRework ? (
        <div
          className={`border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isRunning
              ? 'bg-gradient-to-r from-teal-50 via-blue-50 to-emerald-50 border-teal-200'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-md ${
                isRunning ? 'bg-[#0D9488] shadow-teal-500/20' : 'bg-amber-600 shadow-amber-500/20'
              }`}
            >
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isRunning ? 'text-[#0D9488]' : 'text-amber-800'
                  }`}
                >
                  {isRunning ? 'Rework in Progress' : 'Timer Paused (Saved to Database)'}
                </span>
                {isRunning ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D9488]"></span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                    Paused
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Session Started: <span className="font-semibold">{startedAtStr}</span> • Rate: ₹{user.hourlyRate}/hr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Elapsed Time
              </span>
              <span
                className={`font-mono text-2xl sm:text-3xl font-black tracking-wider ${
                  isRunning ? 'text-[#12345A]' : 'text-amber-800'
                }`}
              >
                {formatTimerDigital(elapsedSeconds)}
              </span>
              <span className="block text-[11px] font-bold text-slate-600 font-mono mt-0.5">
                {formatTimerHuman(elapsedSeconds)}
              </span>
            </div>

            <button
              onClick={handleToggleTimer}
              className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-corporate-gradient shadow-blue-600/20 hover:opacity-95'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Timer' : 'Resume Timer'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 bg-slate-50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Timer Locked (Authentication Required)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Authenticate with employee password to unlock the workspace and run timer from 0hr : 0sec.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Elapsed Time
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-slate-400">
                00:00:00
              </span>
              <span className="block text-[11px] font-bold text-slate-400 font-mono mt-0.5">
                0hr : 0sec
              </span>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate to Start Timer</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Bug Details & Fix Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bug Information (Image 2: Sub-screen 1) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  {currentBug.bugId} <span className="font-medium text-slate-600">{currentBug.title}</span>
                </h3>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                currentBug.severity === 'High'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {currentBug.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 font-semibold block">Original Task</span>
              <span className="font-semibold text-blue-600 text-xs">
                TASK-012 ({currentBug.moduleName})
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Assigned Date</span>
              <span className="font-medium text-slate-700">16 Oct 2025</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Assigned By</span>
              <span className="font-medium text-slate-700">Manager (Michael Scott)</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Correction Deadline</span>
              <span className="font-bold text-rose-600">18 Oct 2025</span>
            </div>
          </div>

          {/* Details / Comments Tabs */}
          <div className="flex border-b border-slate-200 text-xs">
            <button
              onClick={() => setDetailTab('details')}
              className={`pb-2.5 px-3 font-bold transition-all border-b-2 ${
                detailTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Bug Details
            </button>
            <button
              onClick={() => setDetailTab('comments')}
              className={`pb-2.5 px-3 font-bold transition-all border-b-2 ${
                detailTab === 'comments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Manager Notes / Comments
            </button>
          </div>

          {detailTab === 'details' ? (
            <div className="text-xs space-y-3 pt-1">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Description</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                  {currentBug.description}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Steps to Reproduce</span>
                <pre className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  {currentBug.stepsToReproduce ||
                    '1. Enter valid username\n2. Enter password with special characters\n3. Click login'}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Expected Result</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {currentBug.expectedResult || 'User should be able to login successfully.'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Actual Result</span>
                  <p className="text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100 font-medium">
                    {currentBug.actualResult || 'Error message is shown and login fails.'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Evidence</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <span className="font-medium text-slate-700">error-screenshot.png (2.4 MB)</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-semibold">Attached</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-xs">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-amber-800 font-bold block mb-1">Manager Instructions:</span>
                <p className="text-slate-700 leading-relaxed">
                  {currentBug.managerNotes || 'Please ensure UTF-8 encoding support and special character escaping.'}
                </p>
              </div>
            </div>
          )}

          {/* "Authenticate to Fix Defect" button if not authenticated */}
          {!isAuthenticatedForRework && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleOpenReworkModule}
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Authenticate to Start Bug Fixing
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Requires password authentication. Rework timer will run from 0hr : 0sec.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Fix Details Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base">Fix Details</h3>
            <p className="text-xs text-slate-500">Record corrective code changes and submit fix.</p>
          </div>

          {!isAuthenticatedForRework ? (
            <div className="py-16 text-center text-slate-400 space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <Lock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="max-w-xs mx-auto">
                <p className="text-xs font-bold text-slate-700">Authentication Required to Fix Defect</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Please authenticate with your employee password to unlock corrective work submission and start the rework timer from 0hr : 0sec.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenReworkModule}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Authenticate Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitFix} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Fix Description *</label>
                <textarea
                  required
                  rows={3}
                  value={fixDescription}
                  onChange={(e) => setFixDescription(e.target.value)}
                  placeholder="Added validation for special characters in password field and updated backend logic..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Progress</label>
                  <span className="font-bold text-blue-600">{progressPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Current Status</label>
                <select
                  value={fixStatus}
                  onChange={(e) => setFixStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Ready for Review">Ready for Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Attachments (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFixFile(e.target.files[0].name);
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {fixFile && <p className="text-[11px] text-slate-400 mt-1">Attached: {fixFile}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting Fix...' : 'Submit Fix to Manager'}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Timer will stop automatically when you submit the fix. Your rework hours will be recorded.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Auth Modal for Rework Module (Image 2: Sub-screen 2) */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};
