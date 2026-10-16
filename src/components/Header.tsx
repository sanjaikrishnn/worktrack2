import React, { useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import {
  Bell,
  RefreshCw,
  CheckCheck,
  Search,
  Menu,
  PlusCircle,
  Shield,
  Database,
} from 'lucide-react';
import {
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from '../services/api';

interface HeaderProps {
  user: User;
  activeTab: string;
  onRefresh: () => void;
  onSwitchUser?: (identifier: string, role: string) => Promise<void>;
  onNavigateTab?: (tab: string) => void;
  onToggleMobileMenu?: () => void;
  onOpenCreateTask?: () => void;
  onSearchChange?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onRefresh,
  onNavigateTab,
  onToggleMobileMenu,
  onOpenCreateTask,
  onSearchChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const fetchNotifs = async () => {
    try {
      const res = await apiGetNotifications();
      setNotifications(res.notifications || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const unreadCount = notifications.filter((n: NotificationItem) => !n.read).length;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    await fetchNotifs();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleMarkRead = async (id: string, link?: string) => {
    await apiMarkNotificationRead(id);
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => (n.id === id ? { ...n, read: true } : n))
    );
    if (link && onNavigateTab) {
      setShowNotifMenu(false);
      if (link.includes('bug-fixing')) onNavigateTab('bug-fixing');
      else if (link.includes('salary-rework')) onNavigateTab('salary-rework');
      else if (link.includes('manager/progress')) onNavigateTab('manager-progress');
      else if (link.includes('manager/bug-review')) onNavigateTab('manager-bugs');
    }
  };

  const handleMarkAllRead = async () => {
    await apiMarkAllNotificationsRead();
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => ({ ...n, read: true }))
    );
  };

  const getPortalLabel = () => {
    if (user.role === 'employee') return 'Employee Portal';
    if (user.role === 'tester') return 'QA & Testing Portal';
    if (user.role === 'manager') return 'Engineering Manager Portal';
    return 'Executive Admin Portal';
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Employee Dashboard';
      case 'tasks':
        return 'Task Details & Submissions';
      case 'bug-fixing':
        return 'Corrective Bug Fixing & Timer';
      case 'salary-rework':
        return 'My Salary & Rework Details';
      case 'tester-dashboard':
        return 'QA Testing & Module Verification';
      case 'manager-dashboard':
        return 'Executive Management Dashboard';
      case 'manager-tasks':
        return 'Engineering Task Management';
      case 'manager-bugs':
        return 'Bug Triage & Reassignment';
      case 'manager-progress':
        return 'Fix Submissions & Approval Review';
      case 'manager-salary':
        return 'All Employees Rework & Payroll Deductions';
      case 'manager-reports':
        return 'Quality & Defect Rework Analytics';
      case 'profile':
        return 'Employee Profile & IAM Settings';
      default:
        return 'WorkTrack Enterprise';
    }
  };

  return (
    <header className="bg-[#FAF6EF] border-b border-[#DCC7A1] px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Area: Mobile menu & Contextual Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-[#EFE5D3] rounded-xl cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E6B50] bg-[#E8F2EC] px-2 py-0.5 rounded-md border border-[#2E6B50]/30">
              {getPortalLabel()}
            </span>
            <span className="text-[#C6B086]">/</span>
            <span className="text-xs font-semibold text-[#5C675E]">{user.department}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#172033] tracking-tight">{getTabTitle()}</h2>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center max-w-xs w-full mx-4">
        <div className="relative w-full">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            placeholder="Search tasks, defects, modules..."
            className="w-full bg-[#F5EFE3] border border-[#DCC7A1] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2E6B50]/30 focus:border-[#2E6B50] transition-all font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Right Area: Controls & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Manager Quick Create Task Action */}
        {(user.role === 'manager' || user.role === 'admin') && onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="hidden sm:flex items-center gap-1.5 bg-[#2E6B50] hover:bg-[#23543E] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#DCC7A1]" />
            <span>Create Task</span>
          </button>
        )}

        {/* Live Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          title="Synchronize live state with database"
          className="p-2 text-[#2E6B50] hover:text-[#163A2B] hover:bg-[#EFE5D3] rounded-xl transition-all border border-[#DCC7A1] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2E6B50]' : ''}`} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 text-[#2E6B50] hover:text-[#163A2B] hover:bg-[#EFE5D3] rounded-xl transition-all border border-[#DCC7A1] relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#FAF6EF] shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF6EF] rounded-2xl shadow-2xl border border-[#DCC7A1] p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCC7A1]/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2EC] text-[#2E6B50]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#2E6B50] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications found.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id, n.link)}
                      className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                        n.read ? 'bg-slate-50/50 border-slate-100' : 'bg-blue-50/40 border-blue-100'
                      } hover:bg-slate-100`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(
                            new Date(n.createdAt)
                          )}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Database Engine Active Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] rounded-xl text-xs font-semibold text-emerald-800 border border-emerald-200">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">PostgreSQL Active</span>
        </div>
      </div>
    </header>
  );
};
