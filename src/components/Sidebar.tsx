import React from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  CheckSquare,
  Bug,
  WalletCards,
  User as UserIcon,
  LogOut,
  Layers,
  Users,
  Timer,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateTask?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  onOpenCreateTask,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const getNavItems = () => {
    if (user.role === 'employee') {
      return [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Assigned Tasks', icon: CheckSquare },
        { id: 'bug-fixing', label: 'Rework & Bug Fixing', icon: Bug },
        { id: 'salary-rework', label: 'Salary & Deductions', icon: WalletCards },
        { id: 'profile', label: 'My Profile', icon: UserIcon },
      ];
    } else if (user.role === 'tester') {
      return [
        { id: 'tester-dashboard', label: 'QA Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Assigned Operational Tasks', icon: Layers },
        { id: 'tester-bugs', label: 'Report Defect', icon: Bug },
        { id: 'profile', label: 'My Profile', icon: UserIcon },
      ];
    } else {
      // manager or admin
      return [
        { id: 'manager-dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'manager-tasks', label: 'Task Allocation', icon: CheckSquare },
        { id: 'manager-bugs', label: 'Bug Review & Assignment', icon: Bug },
        { id: 'manager-progress', label: 'Fix Progress & Approval', icon: Timer },
        { id: 'manager-salary-rework', label: 'Salary & Deductions', icon: WalletCards },
        { id: 'manager-reports', label: 'Rework Analytics & CSV', icon: BarChart3 },
        { id: 'manager-employees', label: 'Workforce Roster', icon: Users },
        { id: 'profile', label: 'Admin Profile', icon: UserIcon },
      ];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <aside
      className={`bg-[#12345A] text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 shadow-2xl transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/60 bg-[#0E2847]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-corporate-gradient flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
            <ShieldCheck className="w-5 h-5 text-teal-300 stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                WorkTrack
              </h1>
              <p className="text-[10px] text-teal-300 font-medium tracking-wide uppercase">Industrial Quality</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed ? (
        <div className="px-4 py-2.5 bg-[#0A1E34]/80 border-b border-slate-700/40 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Role Portal:</span>
          <span
            className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${
              user.role === 'manager' || user.role === 'admin'
                ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                : user.role === 'tester'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                : 'bg-teal-950/60 text-teal-300 border border-teal-800/50'
            }`}
          >
            {user.role}
          </span>
        </div>
      ) : (
        <div className="py-2 flex justify-center bg-[#0A1E34]/80 border-b border-slate-700/40">
          <span className="w-2 h-2 rounded-full bg-teal-400" title={`Role: ${user.role}`} />
        </div>
      )}

      {/* Quick Action Button for Manager in Sidebar */}
      {(user.role === 'manager' || user.role === 'admin') && onOpenCreateTask && (
        <div className="p-3">
          <button
            onClick={onOpenCreateTask}
            className={`w-full py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCollapsed ? 'px-0' : 'px-3 text-xs'
            }`}
            title="Create Task"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>+ Create Task</span>}
          </button>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-[#1A4676] hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout footer */}
      <div className="p-3 border-t border-slate-700/60 bg-[#0E2847]">
        <div className={`flex items-center gap-2.5 mb-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-teal-500/50 shrink-0"
          />
          {!isCollapsed && (
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.empId} • {user.designation}</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-900/30 rounded-lg transition-colors cursor-pointer ${
            isCollapsed ? 'px-0' : 'px-2'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-xs">
          <div className="relative flex-1 max-w-xs w-full bg-[#12345A]">{sidebarContent}</div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
