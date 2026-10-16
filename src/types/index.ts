export type UserRole = 'employee' | 'tester' | 'manager' | 'admin';

export interface User {
  id: string;
  empId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  hourlyRate: number;
  avatarUrl: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  moduleId: string;
  moduleName: string;
  assignedToUserId: string;
  assignedToName?: string;
  originalDeliveryUserId: string;
  originalDelivererName?: string;
  deadline: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'reopened' | 'overdue';
  submissionFile?: string;
  submissionNotes?: string;
  submittedAt?: string;
  qaStatus?: 'Pass' | 'Fail' | 'Pending';
  qaVerifiedAt?: string;
  qaVerifiedByUserId?: string;
  qaDefectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  previousStatus: string;
  newStatus: string;
  changedByUserId: string;
  comment: string;
  timestamp: string;
}

export interface BugReport {
  id: string;
  bugId: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: 'High' | 'Medium' | 'Low';
  evidenceUrl?: string;
  evidenceName?: string;
  taskId: string;
  taskDisplayId?: string;
  taskTitle?: string;
  moduleId: string;
  moduleName: string;
  reportedByUserId: string;
  reportedByName?: string;
  reportedAt: string;
  status: 'reported' | 'assigned' | 'in_progress' | 'ready_for_review' | 'approved' | 'changes_requested' | 'rejected';
  assignedToUserId?: string;
  assignedToName?: string;
  originalDelivererUserId: string;
  originalDelivererName?: string;
  correctionDeadline?: string;
  managerNotes?: string;
  assignedAt?: string;
}

export interface CorrectiveTimeEntry {
  id: string;
  bugId: string;
  taskId: string;
  moduleName: string;
  employeeId: string;
  hoursSpent: number;
  hoursDisplay: string;
  hourlyRate: number;
  calculatedCost: number;
  proposedDeduction: number;
  status: 'pending' | 'approved' | 'rejected' | 'exempted';
  exemptionReason?: string;
  date: string;
  approvedByUserId?: string;
  approvedAt?: string;
}

export interface FixSubmission {
  id: string;
  bugId: string;
  taskId: string;
  employeeId: string;
  fixDescription: string;
  progressPercentage: number;
  status: 'submitted' | 'approved' | 'changes_requested';
  fixFile?: string;
  notes?: string;
  timeSpentSeconds: number;
  submittedAt: string;
  reviewedByUserId?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface WorkSession {
  id: string;
  bugId: string;
  employeeId: string;
  startedAt: string;
  accumulatedSeconds: number;
  isRunning: boolean;
  lastHeartbeatAt: string;
}
