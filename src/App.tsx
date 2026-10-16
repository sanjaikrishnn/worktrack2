import React, { useState, useEffect, useCallback } from 'react';
import { User, Task, BugReport } from './types';
import {
  apiGetMe,
  apiGetTasks,
  apiGetBugs,
  apiLogout,
  apiLogin,
  subscribeToLiveEvents,
} from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CreateTaskModal } from './components/CreateTaskModal';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { LandingPage } from './pages/LandingPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { TesterDashboard } from './pages/TesterDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { BugReviewPage } from './pages/BugReviewPage';
import { BugFixingPage } from './pages/BugFixingPage';
import { ManagerProgressPage } from './pages/ManagerProgressPage';
import { ReworkReportsPage } from './pages/ReworkReportsPage';
import { EmployeeSalaryReworkPage } from './pages/EmployeeSalaryReworkPage';
import { ManagerSalaryReworkPage } from './pages/ManagerSalaryReworkPage';
import { ManagerDetailedReportPage } from './pages/ManagerDetailedReportPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('T-002');
  const [selectedBugId, setSelectedBugId] = useState<string>('BUG-004');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load user session on mount
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('worktrack_unauthorized', handleUnauthorized);

    apiGetMe()
      .then((res) => {
        setCurrentUser(res.user);
        setDefaultTabForRole(res.user.role);
      })
      .catch(() => {
        // Not logged in or expired token
        setCurrentUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      window.removeEventListener('worktrack_unauthorized', handleUnauthorized);
    };
  }, []);

  const setDefaultTabForRole = (role: string) => {
    if (role === 'employee') setActiveTab('dashboard');
    else if (role === 'tester') setActiveTab('tester-dashboard');
    else setActiveTab('manager-dashboard');
  };

  // Authoritative data fetch
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [tasksRes, bugsRes] = await Promise.all([apiGetTasks(), apiGetBugs()]);
      setTasks(tasksRes.tasks);
      setBugs(bugsRes.bugs);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized')) {
        setCurrentUser(null);
      } else {
        console.error('Data refresh error:', err);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, refreshData]);

  // Real-time synchronization via SSE and window focus
  useEffect(() => {
    if (!currentUser) return;

    // Connect to Server-Sent Events stream
    const unsubscribe = subscribeToLiveEvents((event) => {
      console.log('⚡ Live Event received:', event.type);
      refreshData();
    });

    // Window focus refresh
    const handleFocus = () => {
      refreshData();
    };
    window.addEventListener('focus', handleFocus);

    // Periodic heartbeat poll
    const pollInterval = setInterval(() => {
      refreshData();
    }, 8000);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [currentUser, refreshData]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setDefaultTabForRole(user.role);
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setAuthView('landing');
  };

  const handleOpenTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('tasks');
  };

  const handleOpenBug = (bugId: string) => {
    setSelectedBugId(bugId);
    if (currentUser?.role === 'employee') {
      setActiveTab('bug-fixing');
    } else {
      setActiveTab('manager-bugs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12345A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-teal-200">Initializing WorkTrack...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Render Landing Page, Signup, or Login
  if (!currentUser) {
    if (authView === 'signup') {
      return (
        <SignupPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateLogin={() => setAuthView('login')}
          onNavigateHome={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'login') {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateSignup={() => setAuthView('signup')}
          onNavigateHome={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onNavigateLogin={() => setAuthView('login')}
        onNavigateSignup={() => setAuthView('signup')}
      />
    );
  }

  // Apply search filter if present
  const filteredTasks = tasks.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.taskId.toLowerCase().includes(term) ||
      t.moduleName.toLowerCase().includes(term)
    );
  });

  const filteredBugs = bugs.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.title.toLowerCase().includes(term) ||
      b.bugId.toLowerCase().includes(term) ||
      b.moduleName.toLowerCase().includes(term)
    );
  });

  const selectedTask =
    filteredTasks.find((t) => t.taskId === selectedTaskId || t.id === selectedTaskId) ||
    tasks.find((t) => t.taskId === selectedTaskId || t.id === selectedTaskId) ||
    tasks[0];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex">
      {/* Enterprise Dark Navy Sidebar */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab: string) => setActiveTab(tab)}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          user={currentUser}
          activeTab={activeTab}
          onRefresh={refreshData}
          onNavigateTab={(tab: string) => setActiveTab(tab)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
          onSearchChange={(term: string) => setSearchTerm(term)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Employee Views */}
          {activeTab === 'dashboard' && (
            <EmployeeDashboard
              user={currentUser}
              tasks={filteredTasks}
              bugs={filteredBugs}
              onOpenTask={handleOpenTask}
              onOpenBug={handleOpenBug}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskDetailsPage
              user={currentUser}
              task={selectedTask}
              tasks={filteredTasks}
              onSelectTask={(taskId: string) => setSelectedTaskId(taskId)}
              onBack={() =>
                setActiveTab(
                  currentUser.role === 'tester'
                    ? 'tester-dashboard'
                    : currentUser.role === 'manager' || currentUser.role === 'admin'
                    ? 'manager-dashboard'
                    : 'dashboard'
                )
              }
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'bug-fixing' && (
            <BugFixingPage
              user={currentUser}
              bugs={filteredBugs}
              tasks={filteredTasks}
              initialBugId={selectedBugId}
              onRefresh={refreshData}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'salary-rework' && (
            <EmployeeSalaryReworkPage user={currentUser} onRefresh={refreshData} />
          )}

          {/* Tester Views */}
          {activeTab === 'tester-dashboard' && (
            <TesterDashboard
              user={currentUser}
              tasks={filteredTasks}
              bugs={filteredBugs}
              onRefresh={refreshData}
              onOpenTask={handleOpenTask}
            />
          )}

          {activeTab === 'tester-modules' && (
            <TaskDetailsPage
              user={currentUser}
              task={selectedTask}
              tasks={filteredTasks}
              onSelectTask={(taskId: string) => setSelectedTaskId(taskId)}
              onBack={() => setActiveTab('tester-dashboard')}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'tester-bugs' && (
            <TesterDashboard
              user={currentUser}
              tasks={filteredTasks}
              bugs={filteredBugs}
              onRefresh={refreshData}
              onOpenTask={handleOpenTask}
            />
          )}

          {/* Manager / Admin Views */}
          {activeTab === 'manager-dashboard' && (
            <ManagerDashboard
              user={currentUser}
              tasks={filteredTasks}
              bugs={filteredBugs}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
              onOpenBug={handleOpenBug}
              onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
            />
          )}

          {activeTab === 'manager-employees' && (
            <ManagerDashboard
              user={currentUser}
              tasks={filteredTasks}
              bugs={filteredBugs}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
              onOpenBug={handleOpenBug}
              onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
            />
          )}

          {activeTab === 'manager-tasks' && (
            <ManagerDashboard
              user={currentUser}
              tasks={filteredTasks}
              bugs={filteredBugs}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
              onOpenBug={handleOpenBug}
              onOpenCreateTask={() => setIsCreateTaskModalOpen(true)}
            />
          )}

          {activeTab === 'manager-bugs' && (
            <BugReviewPage
              user={currentUser}
              bugs={filteredBugs}
              tasks={filteredTasks}
              initialBugId={selectedBugId}
              onRefresh={refreshData}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'manager-progress' && (
            <ManagerProgressPage
              user={currentUser}
              bugs={filteredBugs}
              tasks={filteredTasks}
              onRefresh={refreshData}
              onNavigateTab={(tab: string) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'manager-salary-rework' && (
            <ManagerSalaryReworkPage user={currentUser} onRefresh={refreshData} />
          )}

          {activeTab === 'manager-reports' && <ManagerDetailedReportPage user={currentUser} />}

          {/* Shared Profile */}
          {activeTab === 'profile' && <ProfilePage user={currentUser} />}
        </main>
      </div>

      {/* Global Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={async () => {
          await refreshData();
          setActiveTab('manager-dashboard');
        }}
      />
    </div>
  );
}
