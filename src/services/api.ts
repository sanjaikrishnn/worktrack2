import { User, Task, BugReport, CorrectiveTimeEntry, FixSubmission, NotificationItem, WorkSession } from '../types';

const TOKEN_KEY = 'worktrack_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }

    if (response.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('worktrack_unauthorized'));
      }
    }

    throw new Error(errorMsg);
  }

  return response.json();
}

// Authentication
export async function apiLogin(identifier: string, password: string, role?: string) {
  const data = await apiFetch<{ token: string; user: User; message: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password, role }),
  });
  setAuthToken(data.token);
  return data;
}

export async function apiGetMe() {
  return apiFetch<{ user: User }>('/api/auth/me');
}

export async function apiLogout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } finally {
    clearAuthToken();
  }
}

export async function apiVerifyReworkAccess(password: string) {
  return apiFetch<{ verified: boolean; message: string }>('/api/auth/verify-rework-access', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function apiActivateAccount(identifier: string, newPassword: string) {
  return apiFetch<{ success: boolean; message: string }>('/api/auth/activate', {
    method: 'POST',
    body: JSON.stringify({ identifier, newPassword }),
  });
}

export async function apiGetDatabaseStatus() {
  return apiFetch<{
    status: string;
    database: string;
    connected: boolean;
    users: number;
    tasks: number;
    bugs: number;
    projects: number;
    workSessions: number;
    correctiveEntries: number;
    isExternal: boolean;
    connectionError?: string | null;
  }>('/api/database/status');
}

export async function apiGetUsers() {
  return apiFetch<{ users: User[] }>('/api/auth/users');
}

// Tasks
export async function apiGetTasks() {
  return apiFetch<{ tasks: Task[] }>('/api/tasks');
}

export async function apiGetTask(id: string) {
  return apiFetch<{ task: Task; history: any[] }>(`/api/tasks/${id}`);
}

export async function apiCreateTask(payload: { title: string; description: string; moduleName: string; assignedToUserId: string; deadline: string }) {
  return apiFetch<{ task: Task; message: string }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiSubmitTaskWork(id: string, payload: { submissionNotes?: string; fileName?: string }) {
  return apiFetch<{ task: Task; message: string }>(`/api/tasks/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiVerifyTask(
  id: string,
  payload: {
    result: 'PASS' | 'FAIL';
    defectReason?: string;
    defectDescription?: string;
    severity?: 'High' | 'Medium' | 'Low';
    stepsToReproduce?: string;
    expectedResult?: string;
    actualResult?: string;
    evidenceName?: string;
  }
) {
  return apiFetch<{ success: boolean; task: Task; bug?: BugReport; message: string }>(`/api/tasks/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Bugs
export async function apiGetBugs() {
  return apiFetch<{ bugs: BugReport[] }>('/api/bugs');
}

export async function apiGetBug(id: string) {
  return apiFetch<{ bug: BugReport }>(`/api/bugs/${id}`);
}

export async function apiReportBug(payload: {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  severity: 'High' | 'Medium' | 'Low';
  taskId?: string;
  moduleName?: string;
  hasEvidence?: boolean;
}) {
  return apiFetch<{ bug: BugReport; message: string }>('/api/bugs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiAssignBug(id: string, payload: { assignedToUserId: string; correctionDeadline: string; managerNotes?: string }) {
  return apiFetch<{ bug: BugReport; message: string }>(`/api/bugs/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiReviewBug(id: string, payload: { decision: 'approve' | 'request_changes' | 'reject'; reviewNotes?: string }) {
  return apiFetch<{ bug: BugReport; message: string }>(`/api/bugs/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Rework
export async function apiGetReworkSession(bugId: string) {
  return apiFetch<{ session: WorkSession | null; elapsedSeconds: number; isRunning: boolean }>(`/api/rework/session/${bugId}`);
}

export async function apiStartTimer(bugId: string) {
  return apiFetch<{ session: WorkSession; elapsedSeconds: number; isRunning: boolean; message: string }>('/api/rework/timer/start', {
    method: 'POST',
    body: JSON.stringify({ bugId }),
  });
}

export async function apiPauseTimer(bugId: string) {
  return apiFetch<{ session: WorkSession; elapsedSeconds: number; isRunning: boolean; message: string }>('/api/rework/timer/pause', {
    method: 'POST',
    body: JSON.stringify({ bugId }),
  });
}

export async function apiSubmitFix(payload: { bugId: string; fixDescription: string; progressPercentage: number; fixFile?: string; notes?: string }) {
  return apiFetch<{
    success: boolean;
    message: string;
    confirmation: {
      bugId: string;
      taskId: string;
      timeSpent: string;
      submissionDate: string;
      status: string;
    };
  }>('/api/rework/submit-fix', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Payroll
export async function apiGetEmployeeSalarySummary() {
  return apiFetch<{
    employee: any;
    month: string;
    summary: { totalReworkHours: string; totalHoursDecimal: string; reworkCost: number; proposedDeduction: number };
    records: CorrectiveTimeEntry[];
  }>('/api/payroll/employee-summary');
}

export async function apiGetManagerSalarySummary() {
  return apiFetch<{
    month: string;
    totals: { totalReworkHours: string; totalHoursDecimal: string; totalReworkCost: number; totalProposedDeductions: number };
    employeeSummaries: any[];
  }>('/api/payroll/manager-summary');
}

export async function apiApproveDeduction(payload: { entryId: string; action: 'approve' | 'reject' | 'exempt'; exemptionReason?: string; adjustedAmount?: number }) {
  return apiFetch<{ entry: CorrectiveTimeEntry; message: string }>('/api/payroll/approve-deduction', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetDetailedReport(params?: { fromDate?: string; toDate?: string; employeeId?: string }) {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch<any>(`/api/payroll/detailed-report${q ? `?${q}` : ''}`);
}

// System & Notifications
export async function apiGetNotifications() {
  return apiFetch<{ notifications: NotificationItem[] }>('/api/notifications');
}

export async function apiMarkNotificationRead(id: string) {
  return apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' });
}

export async function apiMarkAllNotificationsRead() {
  return apiFetch<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' });
}

export async function apiResetSeed() {
  return apiFetch<{ success: boolean; message: string }>('/api/reset-seed', { method: 'POST' });
}

// SSE live sync listener
export function subscribeToLiveEvents(onEvent: (event: { type: string; data: any; timestamp: string }) => void): () => void {
  try {
    const token = getAuthToken();
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        onEvent(parsed);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = (err) => {
      // EventSource reconnects automatically
    };

    return () => {
      eventSource.close();
    };
  } catch (err) {
    console.error('Failed to connect to SSE:', err);
    return () => {};
  }
}
