import React, { useState } from 'react';
import {
  CheckSquare,
  Bug,
  Clock,
  ShieldCheck,
  BarChart3,
  Laptop,
  Search,
  Wrench,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Users,
} from 'lucide-react';
import { WorkTrackLogo } from '../components/WorkTrackLogo';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateSignup,
}) => {
  const [activeNav, setActiveNav] = useState('Home');

  const scrollToSection = (id: string, name: string) => {
    setActiveNav(name);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FC] text-[#172033] flex flex-col font-sans selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with Image 2 WT arrow mark */}
          <div className="cursor-pointer" onClick={() => scrollToSection('hero', 'Home')}>
            <WorkTrackLogo size="md" theme="brand" />
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('hero', 'Home')}
              className={`hover:text-blue-600 transition-colors cursor-pointer relative py-1 ${
                activeNav === 'Home' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Home
              {activeNav === 'Home' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => scrollToSection('features', 'Features')}
              className={`hover:text-blue-600 transition-colors cursor-pointer relative py-1 ${
                activeNav === 'Features' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Features
              {activeNav === 'Features' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => scrollToSection('workflow', 'How It Works')}
              className={`hover:text-blue-600 transition-colors cursor-pointer relative py-1 ${
                activeNav === 'How It Works' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              How It Works
              {activeNav === 'How It Works' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => scrollToSection('about', 'About')}
              className={`hover:text-blue-600 transition-colors cursor-pointer relative py-1 ${
                activeNav === 'About' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              About
              {activeNav === 'About' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateLogin}
              className="text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onNavigateSignup}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-10 sm:pt-16 pb-16 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline and Call-To-Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/70 border border-blue-200 rounded-full text-xs font-bold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Next-Gen Task & Rework Intelligence
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#172033] leading-[1.12]">
              Track Every Task. <br />
              <span className="text-[#2563EB]">Own Every Fix.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Manage tasks, identify defects, track rework time, and bring transparency to rework costs — all in one platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateSignup}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('features', 'Features')}
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Explore Features
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PBKDF2 Secure Auth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Role Permission Enforced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PostgreSQL Backed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Dashboard Graphic Preview Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-7 relative transition-all">
              {/* Header inside Dashboard Card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    <WorkTrackLogo size="sm" variant="icon-only" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">WorkTrack Dashboard</h3>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Three Stat Widgets */}
              <div className="grid grid-cols-3 gap-3 my-5">
                {/* Stat 1: Total Tasks */}
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3 text-left">
                  <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">Total Tasks</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">248</p>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +12%
                  </span>
                </div>

                {/* Stat 2: Open Bugs */}
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3 text-left">
                  <div className="flex items-center gap-1.5 text-rose-500 mb-1">
                    <Bug className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">Open Bugs</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">23</p>
                  <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +8%
                  </span>
                </div>

                {/* Stat 3: Rework Time */}
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3 text-left">
                  <div className="flex items-center gap-1.5 text-teal-600 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">Rework Time</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">42.5 h</p>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <TrendingDown className="w-3 h-3" /> -15%
                  </span>
                </div>
              </div>

              {/* Lower Section: Donut Chart + Sparkline Trend */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Task Progress Donut */}
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 text-left">
                  <p className="text-xs font-bold text-slate-700 mb-3">Task Progress</p>
                  <div className="flex items-center justify-between">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-emerald-500"
                          strokeDasharray="78, 100"
                          strokeWidth="3.8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-black text-slate-900">78%</span>
                    </div>

                    <div className="space-y-1 text-[10px] font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Pending</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rework Cost Trend Sparkline */}
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-700">Rework Cost Trend</p>
                  </div>
                  <div className="h-16 flex items-end">
                    <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 40">
                      {/* Grid background lines */}
                      <line x1="0" y1="35" x2="100" y2="35" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
                      
                      {/* Trend Curve */}
                      <polyline
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="5,32 25,35 45,22 65,28 85,15 95,12"
                      />
                      {/* Dots on points */}
                      <circle cx="5" cy="32" r="2.5" fill="#2563EB" />
                      <circle cx="25" cy="35" r="2.5" fill="#2563EB" />
                      <circle cx="45" cy="22" r="2.5" fill="#2563EB" />
                      <circle cx="65" cy="28" r="2.5" fill="#2563EB" />
                      <circle cx="85" cy="15" r="2.5" fill="#2563EB" />
                      <circle cx="95" cy="12" r="3" fill="#2563EB" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section id="features" className="py-16 px-4 sm:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
              Powerful Features for Smarter Work Management
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Everything teams need to eliminate repeat errors and align rework accounting.
            </p>
          </div>

          {/* 5 Feature Cards matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Task Management */}
            <div className="bg-[#F8FAFC] border border-slate-200/70 hover:border-blue-400 hover:shadow-lg rounded-2xl p-6 text-center transition-all group flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-2">Task Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Organize and track tasks effortlessly.
              </p>
            </div>

            {/* 2. QA & Bug Tracking */}
            <div className="bg-[#F8FAFC] border border-slate-200/70 hover:border-rose-400 hover:shadow-lg rounded-2xl p-6 text-center transition-all group flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 transition-transform">
                <Bug className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-2">QA & Bug Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Identify and log defects quickly.
              </p>
            </div>

            {/* 3. Automatic Rework Tracking */}
            <div className="bg-[#F8FAFC] border border-slate-200/70 hover:border-emerald-400 hover:shadow-lg rounded-2xl p-6 text-center transition-all group flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-2">Automatic Rework Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Track rework time with precision.
              </p>
            </div>

            {/* 4. Manager Approval */}
            <div className="bg-[#F8FAFC] border border-slate-200/70 hover:border-purple-400 hover:shadow-lg rounded-2xl p-6 text-center transition-all group flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-2">Manager Approval</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Review and approve rework updates.
              </p>
            </div>

            {/* 5. Cost Reports */}
            <div className="bg-[#F8FAFC] border border-slate-200/70 hover:border-amber-400 hover:shadow-lg rounded-2xl p-6 text-center transition-all group flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-2">Cost Reports</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Get detailed reports on rework costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple & Effective Workflow Section */}
      <section id="workflow" className="py-16 px-4 sm:px-8 bg-[#F0F4FC]">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
              Simple & Effective Workflow
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-2">
              From assignment to resolution, each step is transparent and accountable.
            </p>
          </div>

          {/* Workflow Steps with connecting arrows */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* Step 1: Task Assignment */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-md mb-2">
                <Laptop className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-800">Task<br />Assignment</span>
            </div>

            {/* Arrow 1 */}
            <div className="text-slate-400 rotate-90 md:rotate-0">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Step 2: QA Testing */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-md mb-2">
                <Search className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-800">QA<br />Testing</span>
            </div>

            {/* Arrow 2 */}
            <div className="text-slate-400 rotate-90 md:rotate-0">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Step 3: Bug Fix */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-md mb-2">
                <Wrench className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-800">Bug<br />Fix</span>
            </div>

            {/* Arrow 3 */}
            <div className="text-slate-400 rotate-90 md:rotate-0">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Step 4: Approval */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-800">Approval</span>
            </div>

            {/* Arrow 4 */}
            <div className="text-slate-400 rotate-90 md:rotate-0">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Step 5: Reports */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-md mb-2">
                <BarChart3 className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-slate-800">Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section id="about" className="py-16 px-4 sm:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Bring Accountability to Your Engineering Workflow?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
              Create an account now to start logging tasks, conducting QA inspections, and managing corrective rework with PostgreSQL precision.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateSignup}
                className="bg-white text-blue-700 hover:bg-blue-50 font-black text-sm px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer hover:scale-105 inline-flex items-center gap-2"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 sm:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <WorkTrackLogo size="sm" theme="brand" />
          <p>© 2026 WorkTrack System. Rework-Aware Task Tracking & Payroll Deduction Management.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={onNavigateLogin} className="hover:text-blue-600 cursor-pointer">Login</button>
            <span>•</span>
            <button onClick={onNavigateSignup} className="hover:text-blue-600 cursor-pointer">Sign Up</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
