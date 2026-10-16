import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { WorkTrackLogo } from '../components/WorkTrackLogo';
import { apiLogin } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateSignup: () => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateSignup,
  onNavigateHome,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'tester' | 'manager'>('employee');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotMsg('');

    if (!identifier.trim() || !password) {
      setError('Please enter both Email or Employee ID and Password.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiLogin(identifier.trim(), password, role);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotMsg('Password reset instructions can be retrieved from your system administrator.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF3FD] via-[#F3F7FD] to-[#E5EDFA] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Floating Geometry */}
      <div className="absolute top-12 right-20 w-8 h-8 opacity-30">
        <svg viewBox="0 0 100 100" fill="#3B82F6">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>
      <div className="absolute bottom-16 left-16 w-10 h-10 opacity-30">
        <svg viewBox="0 0 100 100" fill="#60A5FA">
          <polygon points="50,15 90,85 10,85" />
        </svg>
      </div>

      {/* Top back button */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>
      </div>

      {/* Main Login Card matching Image 1 Right Screen */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative z-10 text-center">
        {/* Top Illustration (Laptop with tasks checklist, bug badge, clock, and bar chart) */}
        <div className="flex justify-center mb-5">
          <div className="relative w-48 h-32 flex items-center justify-center">
            {/* Soft decorative background circles */}
            <div className="absolute w-36 h-28 bg-blue-50/80 rounded-full blur-md" />

            {/* Laptop Base & Screen */}
            <svg
              viewBox="0 0 200 140"
              className="w-full h-full drop-shadow-md overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Laptop Screen Bezel */}
              <rect x="36" y="22" width="128" height="84" rx="8" fill="#1E293B" />
              {/* Screen Display */}
              <rect x="42" y="28" width="116" height="72" rx="4" fill="#F8FAFC" />
              
              {/* Checklist lines on screen */}
              <rect x="52" y="38" width="12" height="12" rx="3" fill="#2563EB" />
              <path d="M55 44 L58 47 L62 41" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="70" y="42" width="55" height="4" rx="2" fill="#CBD5E1" />

              <rect x="52" y="56" width="12" height="12" rx="3" fill="#2563EB" />
              <path d="M55 62 L58 65 L62 59" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="70" y="60" width="45" height="4" rx="2" fill="#CBD5E1" />

              <rect x="52" y="74" width="12" height="12" rx="3" fill="#E2E8F0" />
              <rect x="70" y="78" width="50" height="4" rx="2" fill="#E2E8F0" />

              {/* Laptop Base & Keyboard */}
              <path d="M20 108 L180 108 L168 116 L32 116 Z" fill="#94A3B8" />
              <rect x="85" y="109" width="30" height="3" rx="1.5" fill="#64748B" />

              {/* Floating Bug Badge (Top Right) */}
              <g transform="translate(142, 14)">
                <circle cx="16" cy="16" r="15" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5" />
                {/* Bug Icon in Badge */}
                <path
                  d="M16 9 C13.5 9 11.5 11 11.5 13.5 C11.5 15.2 12.5 16.6 14 17.4 L14 23 C14 24.1 14.9 25 16 25 C17.1 25 18 24.1 18 23 L18 17.4 C19.5 16.6 20.5 15.2 20.5 13.5 C20.5 11 18.5 9 16 9 Z"
                  fill="#EF4444"
                />
                <line x1="9" y1="16" x2="13" y2="16" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="19" y1="16" x2="23" y2="16" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="21" x2="14" y2="20" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="20" x2="22" y2="21" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Floating Clock Badge (Right) */}
              <g transform="translate(148, 52)">
                <circle cx="14" cy="14" r="13" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
                <circle cx="14" cy="14" r="11" fill="#FFFFFF" />
                <polyline points="14,8 14,14 18,16" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Mini Bar Chart Graphic (Bottom Right) */}
              <g transform="translate(162, 85)">
                <rect x="0" y="16" width="5" height="14" rx="1.5" fill="#93C5FD" />
                <rect x="7" y="9" width="5" height="21" rx="1.5" fill="#60A5FA" />
                <rect x="14" y="2" width="5" height="28" rx="1.5" fill="#2563EB" />
              </g>
            </svg>
          </div>
        </div>

        {/* WorkTrack Logo with Image 2 Logo Mark */}
        <div className="flex flex-col items-center mb-6">
          <div className="cursor-pointer" onClick={onNavigateHome}>
            <WorkTrackLogo size="lg" theme="brand" />
          </div>
          <h2 className="text-2xl font-black text-[#172033] tracking-tight mt-3">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sign in to continue to your workspace.
          </p>
        </div>

        {/* Error and message alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {forgotMsg && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-700 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
            <span>{forgotMsg}</span>
          </div>
        )}

        {/* Login Form matching Image 1 Right Screen */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-left">
          {/* 1. Email or Employee ID */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or Employee ID"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* 2. Password */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* 3. Role Selector */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Users className="w-4 h-4" />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium cursor-pointer"
            >
              <option value="employee">Employee</option>
              <option value="tester">Tester (QA)</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button: Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        {/* Footer: Don't have an account? Sign up */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <button
            onClick={onNavigateSignup}
            className="text-blue-600 hover:underline font-bold cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
