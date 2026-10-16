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

import { WorkTrackLogo } from './WorkTrackLogo';

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
      className={`bg-[#163A2B] text-[#FAF6EF] flex flex-col shrink-0 min-h-screen border-r border-[#2E6B50]/40 shadow-2xl transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#2E6B50]/40 bg-[#102B20]">
        <div className="flex items-center gap-3 overflow-hidden">
          <WorkTrackLogo
            size="md"
            theme="dark"
            variant={isCollapsed ? 'icon-only' : 'horizontal'}
          />
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-[#DCC7A1]/80 hover:text-white hover:bg-[#2E6B50]/40 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed ? (
        <div className="px-4 py-2.5 bg-[#0D241A] border-b border-[#2E6B50]/30 flex items-center justify-between text-xs">
          <span className="text-[#DCC7A1]/80 font-medium text-[11px]">Role Portal:</span>
          <span
            className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${
              user.role === 'manager' || user.role === 'admin'
                ? 'bg-[#2E6B50]/50 text-[#DCC7A1] border border-[#DCC7A1]/40'
                : user.role === 'tester'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                : 'bg-[#1E4D38] text-emerald-200 border border-emerald-500/40'
            }`}
          >
            {user.role}
          </span>
        </div>
      ) : (
        <div className="py-2 flex justify-center bg-[#0D241A] border-b border-[#2E6B50]/30">
          <span className="w-2 h-2 rounded-full bg-[#DCC7A1]" title={`Role: ${user.role}`} />
        </div>
      )}

      {/* Quick Action Button for Manager in Sidebar */}
      {(user.role === 'manager' || user.role === 'admin') && onOpenCreateTask && (
        <div className="p-3">
          <button
            onClick={onOpenCreateTask}
            className={`w-full py-2 bg-[#2E6B50] hover:bg-[#23543E] text-[#FAF6EF] font-bold rounded-xl border border-[#DCC7A1]/30 shadow-md shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCollapsed ? 'px-0' : 'px-3 text-xs'
            }`}
            title="Create Task"
          >
            <PlusCircle className="w-4 h-4 shrink-0 text-[#DCC7A1]" />
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-[#2E6B50] text-[#FAF6EF] shadow-md shadow-emerald-950/40 border-l-4 border-[#DCC7A1]'
                  : 'text-[#DCC7A1]/85 hover:bg-[#1F4D39] hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-[#DCC7A1]' : 'text-[#DCC7A1]/70 group-hover:text-[#DCC7A1]'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#DCC7A1] animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout footer */}
      <div className="p-3 border-t border-[#2E6B50]/40 bg-[#102B20]">
        <div className={`flex items-center gap-2.5 mb-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-[#DCC7A1]/60 shrink-0"
          />
          {!isCollapsed && (
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-[#FAF6EF] truncate">{user.name}</p>
              <p className="text-[10px] text-[#DCC7A1]/70 truncate">{user.empId} • {user.designation}</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-900/40 rounded-lg transition-colors cursor-pointer ${
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
          <div className="relative flex-1 max-w-xs w-full bg-[#163A2B]">{sidebarContent}</div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
