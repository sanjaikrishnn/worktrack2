import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { WorkTrackLogo } from '../components/WorkTrackLogo';
import { apiRegister } from '../services/api';
import { User } from '../types';

interface SignupPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onLoginSuccess,
  onNavigateLogin,
  onNavigateHome,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'employee' | 'tester'>('employee');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !empId.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiRegister({
        name: name.trim(),
        email: email.trim(),
        empId: empId.trim(),
        password,
        role,
      });

      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF3FD] via-[#F3F7FD] to-[#E5EDFA] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Geometric Floating Elements matching Image 1 */}
      <div className="absolute top-10 left-12 w-8 h-8 opacity-40">
        <svg viewBox="0 0 100 100" fill="#3B82F6">
          <polygon points="50,15 90,85 10,85" />
        </svg>
      </div>
      <div className="absolute bottom-12 right-16 w-12 h-12 opacity-30">
        <svg viewBox="0 0 100 100" fill="#60A5FA">
          <polygon points="50,85 10,15 90,15" />
        </svg>
      </div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>
      </div>

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative z-10">
        {/* Top Centered Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="cursor-pointer" onClick={onNavigateHome}>
            <WorkTrackLogo size="lg" theme="brand" />
          </div>
          <h2 className="text-2xl font-black text-[#172033] tracking-tight mt-4">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Start tracking tasks and rework with confidence.
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form matching Image 1 Middle Screen */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Full Name */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* 2. Work Email */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work Email"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* 3. Employee ID */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              placeholder="Employee ID (e.g. EMP001)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* 4. Password */}
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

          {/* 5. Confirm Password */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* 6. Select Your Role */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Shield className="w-4 h-4" />
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

          {/* Submit Button: Create Account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer Link: Already have an account? Log in */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-blue-600 hover:underline font-bold cursor-pointer"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};
