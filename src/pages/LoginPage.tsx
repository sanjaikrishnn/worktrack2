import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Database, KeyRound } from 'lucide-react';
import { apiLogin, apiActivateAccount, apiGetDatabaseStatus } from '../services/api';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Account activation flow state
  const [isActivationMode, setIsActivationMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Database status state
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    users: number;
    isExternal: boolean;
    database: string;
  } | null>(null);

  useEffect(() => {
    apiGetDatabaseStatus()
      .then((res) => {
        setDbStatus({
          connected: res.connected,
          users: res.users,
          isExternal: res.isExternal,
          database: res.database,
        });
      })
      .catch((err) => {
        console.warn('Could not query database status:', err);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter both Email or Employee ID and Password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await apiLogin(identifier, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Aborted') || msg.includes('RuntimeError')) {
        setError('Database engine is syncing. Please click Sign In again.');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !newPassword) {
      setError('Please enter Employee ID/Email and your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await apiActivateAccount(identifier, newPassword);
      setSuccessMsg(res.message);
      setIsActivationMode(false);
      setPassword(newPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to activate account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Branding Showcase */}
        <div className="lg:col-span-5 bg-corporate-gradient p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
                <ShieldCheck className="w-7 h-7 text-teal-300 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">WorkTrack</h1>
                <p className="text-xs text-teal-200 font-semibold tracking-wide uppercase">PostgreSQL Database Engine</p>
              </div>
            </div>
            <p className="text-sm text-slate-100 font-normal mt-2 leading-relaxed opacity-90">
              Rework-Aware Task Tracking & Payroll Deduction Management
            </p>

            {/* Database Engine Status Badge */}
            <div className="my-8 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-left relative">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-teal-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-200">Database Engine</span>
              </div>
              <p className="text-sm font-semibold text-white">
                {dbStatus?.isExternal ? 'Cloud PostgreSQL Server' : 'Local PostgreSQL 18 Engine'}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-teal-200 font-bold bg-teal-950/40 py-1 px-3 rounded-full border border-teal-500/30 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                {dbStatus ? `${dbStatus.users} Registered Employee Accounts` : 'Connecting to Database...'}
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-xs space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-200">Authoritative Security:</p>
            <div className="flex items-center gap-2 text-slate-100 opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
              <span>PBKDF2-SHA512 password hashing & token sessions</span>
            </div>
            <div className="flex items-center gap-2 text-slate-100 opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
              <span>Server-enforced role permissions (Employee, QA, Manager)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-100 opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300" />
              <span>Permanent relational database records (PostgreSQL)</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#172033] tracking-tight">
                {isActivationMode ? 'Activate Account' : 'Employee Login'}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
                {isActivationMode
                  ? 'Set up your secure password for your WorkTrack account'
                  : 'Enter your organizational credentials to access your portal'}
              </p>
            </div>

            {/* Empty State Banner if Database is empty */}
            {dbStatus && dbStatus.users === 0 && (
              <div className="mb-5 p-4 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Database Empty State</span>
                </div>
                <p>
                  PostgreSQL is connected but contains no employee accounts. Initialize the schema and dataset using{' '}
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">database/dataset.sql</code>.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 text-rose-800 text-xs rounded-xl flex items-center gap-2.5 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 bg-teal-50 text-teal-800 text-xs rounded-xl flex items-center gap-2.5 border border-teal-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {!isActivationMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Email or Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. EMP001 or john.doe@worktrack.com"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all pl-10 text-slate-900 font-medium"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all pl-10 pr-10 text-slate-900 font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-corporate-gradient text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In to WorkTrack'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Employee ID or Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. EMP001"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    New Secure Password (min 6 chars) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? 'Activating...' : 'Activate & Set Password'}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between text-xs text-[#64748B]">
              <button
                type="button"
                onClick={() => {
                  setIsActivationMode(!isActivationMode);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                {isActivationMode ? '← Back to Login' : 'First time? Activate Account / Set Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
