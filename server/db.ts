import { query, exec, hashPassword, verifyPassword } from './pg.js';

export interface User {
  id: string;
  empId: string;
  name: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  role: 'employee' | 'tester' | 'manager' | 'admin';
  department: string;
  designation: string;
  hourlyRate: number; // in INR (₹)
  avatarUrl: string;
  active: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  taskId: string; // e.g. T-001, TASK-012
  title: string;
  description: string;
  moduleId: string;
  moduleName: string;
  assignedToUserId: string;
  originalDeliveryUserId: string;
  createdByUserId: string;
  deadline: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'reopened' | 'overdue' | 'cancelled';
  submissionFile?: string;
  submissionNotes?: string;
  submittedAt?: string;
  qaStatus?: 'Pass' | 'Fail' | 'Pending';
  qaVerifiedAt?: string;
  qaVerifiedByUserId?: string;
  qaDefectReason?: string;
  createdAt: string;
  updatedAt: string;
  assignedToName?: string;
  originalDelivererName?: string;
  createdByName?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  previousStatus: string;
  newStatus: string;
  changedByUserId: string;
  comment: string;
  timestamp: string;
  changedByName?: string;
}

export interface BugReport {
  id: string;
  bugId: string; // e.g. BUG-001, BUG-004
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: 'High' | 'Medium' | 'Low' | 'Critical';
  evidenceUrl?: string;
  evidenceName?: string;
  taskId: string;
  moduleId: string;
  moduleName: string;
  reportedByUserId: string; // tester
  reportedAt: string;
  status: 'reported' | 'assigned' | 'in_progress' | 'ready_for_review' | 'approved' | 'changes_requested' | 'rejected' | 'closed';
  assignedToUserId?: string; // fixing employee
  originalDelivererUserId: string; // original employee who delivered the module
  correctionDeadline?: string;
  managerNotes?: string;
  assignedAt?: string;
  assignedByUserId?: string;
  reportedByName?: string;
  assignedToName?: string;
  originalDelivererName?: string;
}

export interface FixSubmission {
  id: string;
  bugId: string;
  taskId: string;
  employeeId: string;
  fixDescription: string;
  progressPercentage: number;
  status: 'submitted' | 'approved' | 'changes_requested' | 'rejected';
  fixFile?: string;
  notes?: string;
  timeSpentSeconds: number;
  submittedAt: string;
  reviewedByUserId?: string;
  reviewNotes?: string;
  reviewedAt?: string;
}

export interface WorkSession {
  id: string;
  bugId: string;
  employeeId: string;
  startedAt: string | null; // ISO string or null if paused
  accumulatedSeconds: number;
  isRunning: boolean;
  lastHeartbeatAt: string | null;
  updatedAt: string;
  stoppedAt?: string | null;
}

export interface CorrectiveTimeEntry {
  id: string;
  bugId: string;
  taskId: string;
  moduleName: string;
  employeeId: string;
  hoursSpent: number; // decimal hours (e.g. 2.6 for 2h 36m)
  hoursDisplay: string; // e.g. "2h 36m"
  hourlyRate: number;
  calculatedCost: number; // hours * hourlyRate
  proposedDeduction: number;
  status: 'pending' | 'approved' | 'rejected' | 'exempted';
  exemptionReason?: string;
  entryDate: string;
  approvedByUserId?: string;
  approvedAt?: string;
  employeeName?: string;
  employeeRole?: string;
  employeeCode?: string;
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

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Module {
  id: string;
  projectId: string;
  name: string;
  description: string;
}

// ============================================================================
// PostgreSQL Data Access Layer
// ============================================================================

export const pgDb = {
  // --------------------------------------------------------------------------
  // Users
  // --------------------------------------------------------------------------
  async getUsers(): Promise<User[]> {
    const res = await query<any>(`
      SELECT id, emp_id as "empId", name, email, password_hash as "passwordHash",
             salt, role, department, designation, hourly_rate as "hourlyRate",
             avatar_url as "avatarUrl", active, created_at as "createdAt"
      FROM users
      ORDER BY name ASC;
    `);
    return res.rows.map(mapUserRow);
  },

  async getUserById(id: string): Promise<User | null> {
    const res = await query<any>(`
      SELECT id, emp_id as "empId", name, email, password_hash as "passwordHash",
             salt, role, department, designation, hourly_rate as "hourlyRate",
             avatar_url as "avatarUrl", active, created_at as "createdAt"
      FROM users
      WHERE id = $1;
    `, [id]);
    return res.rows.length ? mapUserRow(res.rows[0]) : null;
  },

  async findUserByIdentifier(identifier: string): Promise<User | null> {
    const clean = identifier.trim().toLowerCase();
    const res = await query<any>(`
      SELECT id, emp_id as "empId", name, email, password_hash as "passwordHash",
             salt, role, department, designation, hourly_rate as "hourlyRate",
             avatar_url as "avatarUrl", active, created_at as "createdAt"
      FROM users
      WHERE (LOWER(email) = $1 OR LOWER(emp_id) = $1);
    `, [clean]);
    return res.rows.length ? mapUserRow(res.rows[0]) : null;
  },

  async updateUserPassword(userId: string, hash: string, salt: string): Promise<void> {
    await query(`
      UPDATE users
      SET password_hash = $1, salt = $2, active = TRUE
      WHERE id = $3;
    `, [hash, salt, userId]);
  },

  async createUser(u: User): Promise<User> {
    await query(`
      INSERT INTO users (id, emp_id, name, email, password_hash, salt, role, department, designation, hourly_rate, avatar_url, active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `, [
      u.id, u.empId, u.name, u.email, u.passwordHash || null, u.salt || null,
      u.role, u.department, u.designation, u.hourlyRate, u.avatarUrl, u.active, u.createdAt
    ]);
    return u;
  },

  // --------------------------------------------------------------------------
  // Tasks
  // --------------------------------------------------------------------------
  async getTasks(userId?: string, role?: string): Promise<Task[]> {
    let sql = `
      SELECT t.id, t.task_id as "taskId", t.title, t.description, t.module_id as "moduleId",
             t.module_name as "moduleName", t.assigned_to_user_id as "assignedToUserId",
             t.original_delivery_user_id as "originalDeliveryUserId", t.created_by_user_id as "createdByUserId",
             TO_CHAR(t.deadline, 'YYYY-MM-DD') as deadline, t.progress, t.status,
             t.submission_file as "submissionFile", t.submission_notes as "submissionNotes",
             t.submitted_at as "submittedAt", t.qa_status as "qaStatus",
             t.qa_verified_at as "qaVerifiedAt", t.qa_verified_by_user_id as "qaVerifiedByUserId",
             t.qa_defect_reason as "qaDefectReason", t.created_at as "createdAt", t.updated_at as "updatedAt",
             u_assigned.name as "assignedToName",
             u_orig.name as "originalDelivererName",
             u_creator.name as "createdByName"
      FROM tasks t
      LEFT JOIN users u_assigned ON t.assigned_to_user_id = u_assigned.id
      LEFT JOIN users u_orig ON t.original_delivery_user_id = u_orig.id
      LEFT JOIN users u_creator ON t.created_by_user_id = u_creator.id
    `;
    const params: any[] = [];

    if (role === 'employee' && userId) {
      sql += ` WHERE t.assigned_to_user_id = $1 OR t.original_delivery_user_id = $1`;
      params.push(userId);
    }

    sql += ` ORDER BY t.created_at DESC;`;

    const res = await query<any>(sql, params);
    return res.rows.map(mapTaskRow);
  },

  async getTaskById(id: string): Promise<Task | null> {
    const res = await query<any>(`
      SELECT t.id, t.task_id as "taskId", t.title, t.description, t.module_id as "moduleId",
             t.module_name as "moduleName", t.assigned_to_user_id as "assignedToUserId",
             t.original_delivery_user_id as "originalDeliveryUserId", t.created_by_user_id as "createdByUserId",
             TO_CHAR(t.deadline, 'YYYY-MM-DD') as deadline, t.progress, t.status,
             t.submission_file as "submissionFile", t.submission_notes as "submissionNotes",
             t.submitted_at as "submittedAt", t.qa_status as "qaStatus",
             t.qa_verified_at as "qaVerifiedAt", t.qa_verified_by_user_id as "qaVerifiedByUserId",
             t.qa_defect_reason as "qaDefectReason", t.created_at as "createdAt", t.updated_at as "updatedAt",
             u_assigned.name as "assignedToName",
             u_orig.name as "originalDelivererName",
             u_creator.name as "createdByName"
      FROM tasks t
      LEFT JOIN users u_assigned ON t.assigned_to_user_id = u_assigned.id
      LEFT JOIN users u_orig ON t.original_delivery_user_id = u_orig.id
      LEFT JOIN users u_creator ON t.created_by_user_id = u_creator.id
      WHERE t.id = $1 OR t.task_id = $1;
    `, [id]);
    return res.rows.length ? mapTaskRow(res.rows[0]) : null;
  },

  async createTask(t: Partial<Task>): Promise<Task> {
    const res = await query<any>(`
      INSERT INTO tasks
      (id, task_id, title, description, module_id, module_name, assigned_to_user_id,
       original_delivery_user_id, created_by_user_id, deadline, progress, status, qa_status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id, task_id as "taskId", title, description, module_id as "moduleId",
                module_name as "moduleName", assigned_to_user_id as "assignedToUserId",
                original_delivery_user_id as "originalDeliveryUserId", created_by_user_id as "createdByUserId",
                TO_CHAR(deadline, 'YYYY-MM-DD') as deadline, progress, status, qa_status as "qaStatus",
                created_at as "createdAt", updated_at as "updatedAt";
    `, [
      t.id, t.taskId, t.title, t.description || '', t.moduleId || null, t.moduleName || '',
      t.assignedToUserId || null, t.originalDeliveryUserId || t.assignedToUserId || null,
      t.createdByUserId, t.deadline ? t.deadline : null, t.progress || 0,
      t.status || 'pending', t.qaStatus || 'Pending'
    ]);
    return mapTaskRow(res.rows[0]);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(updates.title); }
    if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.description); }
    if (updates.progress !== undefined) { fields.push(`progress = $${idx++}`); values.push(updates.progress); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.assignedToUserId !== undefined) { fields.push(`assigned_to_user_id = $${idx++}`); values.push(updates.assignedToUserId); }
    if (updates.deadline !== undefined) { fields.push(`deadline = $${idx++}`); values.push(updates.deadline ? updates.deadline : null); }
    if (updates.submissionFile !== undefined) { fields.push(`submission_file = $${idx++}`); values.push(updates.submissionFile); }
    if (updates.submissionNotes !== undefined) { fields.push(`submission_notes = $${idx++}`); values.push(updates.submissionNotes); }
    if (updates.submittedAt !== undefined) { fields.push(`submitted_at = $${idx++}`); values.push(updates.submittedAt); }
    if (updates.qaStatus !== undefined) { fields.push(`qa_status = $${idx++}`); values.push(updates.qaStatus); }
    if (updates.qaVerifiedAt !== undefined) { fields.push(`qa_verified_at = $${idx++}`); values.push(updates.qaVerifiedAt); }
    if (updates.qaVerifiedByUserId !== undefined) { fields.push(`qa_verified_by_user_id = $${idx++}`); values.push(updates.qaVerifiedByUserId); }
    if (updates.qaDefectReason !== undefined) { fields.push(`qa_defect_reason = $${idx++}`); values.push(updates.qaDefectReason); }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${idx} OR task_id = $${idx}
      RETURNING *;
    `;
    const res = await query<any>(sql, values);
    return res.rows.length ? mapTaskRow(res.rows[0]) : null;
  },

  async addTaskHistory(h: TaskHistory): Promise<void> {
    await query(`
      INSERT INTO task_status_history (id, task_id, previous_status, new_status, changed_by_user_id, comment, "timestamp")
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [h.id, h.taskId, h.previousStatus || null, h.newStatus, h.changedByUserId || null, h.comment || '', h.timestamp || new Date().toISOString()]);
  },

  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    const res = await query<any>(`
      SELECT h.id, h.task_id as "taskId", h.previous_status as "previousStatus",
             h.new_status as "newStatus", h.changed_by_user_id as "changedByUserId",
             h.comment, h.timestamp, u.name as "changedByName"
      FROM task_status_history h
      LEFT JOIN users u ON h.changed_by_user_id = u.id
      WHERE h.task_id = $1
      ORDER BY h.timestamp DESC;
    `, [taskId]);
    return res.rows;
  },

  // --------------------------------------------------------------------------
  // Bug Reports
  // --------------------------------------------------------------------------
  async getBugs(userId?: string, role?: string): Promise<BugReport[]> {
    let sql = `
      SELECT b.id, b.bug_id as "bugId", b.title, b.description, b.steps_to_reproduce as "stepsToReproduce",
             b.expected_result as "expectedResult", b.actual_result as "actualResult", b.severity,
             b.evidence_url as "evidenceUrl", b.evidence_name as "evidenceName", b.task_id as "taskId",
             b.module_id as "moduleId", b.module_name as "moduleName",
             b.reported_by_user_id as "reportedByUserId", b.reported_at as "reportedAt", b.status,
             b.assigned_to_user_id as "assignedToUserId",
             b.original_deliverer_user_id as "originalDelivererUserId",
             TO_CHAR(b.correction_deadline, 'YYYY-MM-DD') as "correctionDeadline",
             b.manager_notes as "managerNotes", b.assigned_at as "assignedAt",
             b.assigned_by_user_id as "assignedByUserId",
             u_rep.name as "reportedByName",
             u_assign.name as "assignedToName",
             u_orig.name as "originalDelivererName"
      FROM bug_reports b
      LEFT JOIN users u_rep ON b.reported_by_user_id = u_rep.id
      LEFT JOIN users u_assign ON b.assigned_to_user_id = u_assign.id
      LEFT JOIN users u_orig ON b.original_deliverer_user_id = u_orig.id
    `;
    const params: any[] = [];

    if (role === 'employee' && userId) {
      sql += ` WHERE b.assigned_to_user_id = $1 OR b.original_deliverer_user_id = $1`;
      params.push(userId);
    }

    sql += ` ORDER BY b.reported_at DESC;`;

    const res = await query<any>(sql, params);
    return res.rows.map(mapBugRow);
  },

  async getBugById(id: string): Promise<BugReport | null> {
    const res = await query<any>(`
      SELECT b.id, b.bug_id as "bugId", b.title, b.description, b.steps_to_reproduce as "stepsToReproduce",
             b.expected_result as "expectedResult", b.actual_result as "actualResult", b.severity,
             b.evidence_url as "evidenceUrl", b.evidence_name as "evidenceName", b.task_id as "taskId",
             b.module_id as "moduleId", b.module_name as "moduleName",
             b.reported_by_user_id as "reportedByUserId", b.reported_at as "reportedAt", b.status,
             b.assigned_to_user_id as "assignedToUserId",
             b.original_deliverer_user_id as "originalDelivererUserId",
             TO_CHAR(b.correction_deadline, 'YYYY-MM-DD') as "correctionDeadline",
             b.manager_notes as "managerNotes", b.assigned_at as "assignedAt",
             b.assigned_by_user_id as "assignedByUserId",
             u_rep.name as "reportedByName",
             u_assign.name as "assignedToName",
             u_orig.name as "originalDelivererName"
      FROM bug_reports b
      LEFT JOIN users u_rep ON b.reported_by_user_id = u_rep.id
      LEFT JOIN users u_assign ON b.assigned_to_user_id = u_assign.id
      LEFT JOIN users u_orig ON b.original_deliverer_user_id = u_orig.id
      WHERE b.id = $1 OR b.bug_id = $1;
    `, [id]);
    return res.rows.length ? mapBugRow(res.rows[0]) : null;
  },

  async createBug(b: Partial<BugReport>): Promise<BugReport> {
    const res = await query<any>(`
      INSERT INTO bug_reports
      (id, bug_id, title, description, steps_to_reproduce, expected_result, actual_result, severity,
       evidence_url, evidence_name, task_id, module_id, module_name, reported_by_user_id,
       reported_at, status, assigned_to_user_id, original_deliverer_user_id, correction_deadline,
       manager_notes, assigned_at, assigned_by_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), $15, $16, $17, $18, $19, $20, $21)
      RETURNING *;
    `, [
      b.id, b.bugId, b.title, b.description, b.stepsToReproduce || '', b.expectedResult || '',
      b.actualResult || '', b.severity || 'Medium', b.evidenceUrl || null, b.evidenceName || null,
      b.taskId || null, b.moduleId || null, b.moduleName || '', b.reportedByUserId || null,
      b.status || 'reported', b.assignedToUserId || null, b.originalDelivererUserId || null,
      b.correctionDeadline ? b.correctionDeadline : null, b.managerNotes || null,
      b.assignedAt || null, b.assignedByUserId || null
    ]);
    return mapBugRow(res.rows[0]);
  },

  async updateBug(id: string, updates: Partial<BugReport>): Promise<BugReport | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.assignedToUserId !== undefined) { fields.push(`assigned_to_user_id = $${idx++}`); values.push(updates.assignedToUserId); }
    if (updates.correctionDeadline !== undefined) { fields.push(`correction_deadline = $${idx++}`); values.push(updates.correctionDeadline ? updates.correctionDeadline : null); }
    if (updates.managerNotes !== undefined) { fields.push(`manager_notes = $${idx++}`); values.push(updates.managerNotes); }
    if (updates.assignedAt !== undefined) { fields.push(`assigned_at = $${idx++}`); values.push(updates.assignedAt); }
    if (updates.assignedByUserId !== undefined) { fields.push(`assigned_by_user_id = $${idx++}`); values.push(updates.assignedByUserId); }

    values.push(id);
    const sql = `
      UPDATE bug_reports
      SET ${fields.join(', ')}
      WHERE id = $${idx} OR bug_id = $${idx}
      RETURNING *;
    `;
    const res = await query<any>(sql, values);
    return res.rows.length ? mapBugRow(res.rows[0]) : null;
  },

  // --------------------------------------------------------------------------
  // Work Sessions (Timer)
  // --------------------------------------------------------------------------
  async getWorkSession(bugId: string, employeeId: string): Promise<WorkSession | null> {
    const res = await query<any>(`
      SELECT id, bug_id as "bugId", employee_id as "employeeId",
             started_at as "startedAt", accumulated_seconds as "accumulatedSeconds",
             is_running as "isRunning", last_heartbeat_at as "lastHeartbeatAt",
             updated_at as "updatedAt", stopped_at as "stoppedAt"
      FROM work_sessions
      WHERE bug_id = $1 AND employee_id = $2;
    `, [bugId, employeeId]);
    return res.rows.length ? res.rows[0] : null;
  },

  async saveWorkSession(s: WorkSession): Promise<WorkSession> {
    await query(`
      INSERT INTO work_sessions (id, bug_id, employee_id, started_at, accumulated_seconds, is_running, last_heartbeat_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE
      SET started_at = EXCLUDED.started_at,
          accumulated_seconds = EXCLUDED.accumulated_seconds,
          is_running = EXCLUDED.is_running,
          last_heartbeat_at = EXCLUDED.last_heartbeat_at,
          updated_at = NOW();
    `, [
      s.id, s.bugId, s.employeeId, s.startedAt, s.accumulatedSeconds || 0,
      s.isRunning, s.lastHeartbeatAt
    ]);
    return s;
  },

  // --------------------------------------------------------------------------
  // Fix Submissions
  // --------------------------------------------------------------------------
  async getFixSubmissions(bugId?: string): Promise<FixSubmission[]> {
    let sql = `
      SELECT id, bug_id as "bugId", task_id as "taskId", employee_id as "employeeId",
             fix_description as "fixDescription", progress_percentage as "progressPercentage",
             status, fix_file as "fixFile", notes, time_spent_seconds as "timeSpentSeconds",
             submitted_at as "submittedAt", reviewed_by_user_id as "reviewedByUserId",
             review_notes as "reviewNotes", reviewed_at as "reviewedAt"
      FROM fix_submissions
    `;
    const params: any[] = [];
    if (bugId) {
      sql += ` WHERE bug_id = $1`;
      params.push(bugId);
    }
    sql += ` ORDER BY submitted_at DESC;`;

    const res = await query<any>(sql, params);
    return res.rows;
  },

  async createFixSubmission(f: FixSubmission): Promise<FixSubmission> {
    await query(`
      INSERT INTO fix_submissions
      (id, bug_id, task_id, employee_id, fix_description, progress_percentage, status, fix_file, notes, time_spent_seconds, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
    `, [
      f.id, f.bugId, f.taskId || null, f.employeeId, f.fixDescription,
      f.progressPercentage || 100, f.status || 'submitted', f.fixFile || null,
      f.notes || null, f.timeSpentSeconds || 0, f.submittedAt || new Date().toISOString()
    ]);
    return f;
  },

  async updateFixSubmission(idOrBugId: string, updates: Partial<FixSubmission>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.reviewedByUserId !== undefined) { fields.push(`reviewed_by_user_id = $${idx++}`); values.push(updates.reviewedByUserId); }
    if (updates.reviewNotes !== undefined) { fields.push(`review_notes = $${idx++}`); values.push(updates.reviewNotes); }
    if (updates.reviewedAt !== undefined) { fields.push(`reviewed_at = $${idx++}`); values.push(updates.reviewedAt); }

    values.push(idOrBugId);
    const sql = `
      UPDATE fix_submissions
      SET ${fields.join(', ')}
      WHERE id = $${idx} OR bug_id = $${idx};
    `;
    await query(sql, values);
  },

  // --------------------------------------------------------------------------
  // Corrective Time Entries (Payroll)
  // --------------------------------------------------------------------------
  async getCorrectiveEntries(employeeId?: string): Promise<CorrectiveTimeEntry[]> {
    let sql = `
      SELECT c.id, c.bug_id as "bugId", c.task_id as "taskId", c.module_name as "moduleName",
             c.employee_id as "employeeId", c.hours_spent as "hoursSpent",
             c.hours_display as "hoursDisplay", c.hourly_rate as "hourlyRate",
             c.calculated_cost as "calculatedCost", c.proposed_deduction as "proposedDeduction",
             c.status, c.exemption_reason as "exemptionReason", c.entry_date as "entryDate",
             c.approved_by_user_id as "approvedByUserId", c.approved_at as "approvedAt",
             u.name as "employeeName", u.role as "employeeRole", u.emp_id as "employeeCode"
      FROM corrective_time_entries c
      LEFT JOIN users u ON c.employee_id = u.id
    `;
    const params: any[] = [];
    if (employeeId) {
      sql += ` WHERE c.employee_id = $1`;
      params.push(employeeId);
    }
    sql += ` ORDER BY c.id DESC;`;

    const res = await query<any>(sql, params);
    return res.rows.map((row) => ({
      ...row,
      hoursSpent: parseFloat(row.hoursSpent || 0),
      hourlyRate: parseFloat(row.hourlyRate || 0),
      calculatedCost: parseFloat(row.calculatedCost || 0),
      proposedDeduction: parseFloat(row.proposedDeduction || 0),
    }));
  },

  async createCorrectiveEntry(e: CorrectiveTimeEntry): Promise<CorrectiveTimeEntry> {
    await query(`
      INSERT INTO corrective_time_entries
      (id, bug_id, task_id, module_name, employee_id, hours_spent, hours_display, hourly_rate, calculated_cost, proposed_deduction, status, exemption_reason, entry_date, approved_by_user_id, approved_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
    `, [
      e.id, e.bugId, e.taskId || '', e.moduleName || '', e.employeeId,
      e.hoursSpent, e.hoursDisplay, e.hourlyRate, e.calculatedCost,
      e.proposedDeduction, e.status, e.exemptionReason || null,
      e.entryDate, e.approvedByUserId || null, e.approvedAt || null
    ]);
    return e;
  },

  async updateCorrectiveEntry(id: string, updates: Partial<CorrectiveTimeEntry>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.proposedDeduction !== undefined) { fields.push(`proposed_deduction = $${idx++}`); values.push(updates.proposedDeduction); }
    if (updates.exemptionReason !== undefined) { fields.push(`exemption_reason = $${idx++}`); values.push(updates.exemptionReason); }
    if (updates.approvedByUserId !== undefined) { fields.push(`approved_by_user_id = $${idx++}`); values.push(updates.approvedByUserId); }
    if (updates.approvedAt !== undefined) { fields.push(`approved_at = $${idx++}`); values.push(updates.approvedAt); }

    values.push(id);
    const sql = `
      UPDATE corrective_time_entries
      SET ${fields.join(', ')}
      WHERE id = $${idx} OR bug_id = $${idx};
    `;
    await query(sql, values);
  },

  // --------------------------------------------------------------------------
  // Notifications
  // --------------------------------------------------------------------------
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const res = await query<any>(`
      SELECT id, user_id as "userId", title, message, type, read, link, created_at as "createdAt"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `, [userId]);
    return res.rows;
  },

  async createNotification(n: NotificationItem): Promise<void> {
    await query(`
      INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [n.id, n.userId, n.title, n.message, n.type, n.read, n.link || null, n.createdAt || new Date().toISOString()]);
  },

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await query(`
      UPDATE notifications
      SET read = TRUE
      WHERE id = $1 AND user_id = $2;
    `, [id, userId]);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await query(`
      UPDATE notifications
      SET read = TRUE
      WHERE user_id = $1;
    `, [userId]);
  },

  // --------------------------------------------------------------------------
  // Audit Logs
  // --------------------------------------------------------------------------
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await query<any>(`
      SELECT id, user_id as "userId", user_name as "userName", action,
             entity_type as "entityType", entity_id as "entityId", details,
             timestamp
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 100;
    `);
    return res.rows;
  },

  async createAuditLog(l: AuditLog): Promise<void> {
    await query(`
      INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details, "timestamp")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [l.id, l.userId, l.userName, l.action, l.entityType, l.entityId || null, l.details, l.timestamp || new Date().toISOString()]);
  },

  // --------------------------------------------------------------------------
  // Projects & Modules
  // --------------------------------------------------------------------------
  async getProjects(): Promise<Project[]> {
    const res = await query<any>(`SELECT id, name, description, created_at as "createdAt" FROM projects ORDER BY name;`);
    return res.rows;
  },

  async getModules(): Promise<Module[]> {
    const res = await query<any>(`SELECT id, project_id as "projectId", name, description FROM modules ORDER BY name;`);
    return res.rows;
  }
};

// Row mappers for consistent property types
function mapUserRow(row: any): User {
  return {
    id: row.id,
    empId: row.empId || row.emp_id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash || row.password_hash,
    salt: row.salt,
    role: row.role,
    department: row.department || '',
    designation: row.designation || '',
    hourlyRate: parseFloat(row.hourlyRate || row.hourly_rate || 0),
    avatarUrl: row.avatarUrl || row.avatar_url || '',
    active: row.active ?? true,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  };
}

function mapTaskRow(row: any): Task {
  return {
    id: row.id,
    taskId: row.taskId || row.task_id,
    title: row.title,
    description: row.description || '',
    moduleId: row.moduleId || row.module_id || '',
    moduleName: row.moduleName || row.module_name || '',
    assignedToUserId: row.assignedToUserId || row.assigned_to_user_id || '',
    originalDeliveryUserId: row.originalDeliveryUserId || row.original_delivery_user_id || '',
    createdByUserId: row.createdByUserId || row.created_by_user_id || '',
    deadline: row.deadline || '',
    progress: parseInt(row.progress || 0, 10),
    status: row.status,
    submissionFile: row.submissionFile || row.submission_file || undefined,
    submissionNotes: row.submissionNotes || row.submission_notes || undefined,
    submittedAt: row.submittedAt || row.submitted_at ? new Date(row.submittedAt || row.submitted_at).toISOString() : undefined,
    qaStatus: row.qaStatus || row.qa_status || 'Pending',
    qaVerifiedAt: row.qaVerifiedAt || row.qa_verified_at ? new Date(row.qaVerifiedAt || row.qa_verified_at).toISOString() : undefined,
    qaVerifiedByUserId: row.qaVerifiedByUserId || row.qa_verified_by_user_id || undefined,
    qaDefectReason: row.qaDefectReason || row.qa_defect_reason || undefined,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
    assignedToName: row.assignedToName || undefined,
    originalDelivererName: row.originalDelivererName || undefined,
    createdByName: row.createdByName || undefined,
  };
}

function mapBugRow(row: any): BugReport {
  return {
    id: row.id,
    bugId: row.bugId || row.bug_id,
    title: row.title,
    description: row.description,
    stepsToReproduce: row.stepsToReproduce || row.steps_to_reproduce || '',
    expectedResult: row.expectedResult || row.expected_result || '',
    actualResult: row.actualResult || row.actual_result || '',
    severity: row.severity,
    evidenceUrl: row.evidenceUrl || row.evidence_url || undefined,
    evidenceName: row.evidenceName || row.evidence_name || undefined,
    taskId: row.taskId || row.task_id || '',
    moduleId: row.moduleId || row.module_id || '',
    moduleName: row.moduleName || row.module_name || '',
    reportedByUserId: row.reportedByUserId || row.reported_by_user_id || '',
    reportedAt: row.reportedAt ? new Date(row.reportedAt).toISOString() : new Date().toISOString(),
    status: row.status,
    assignedToUserId: row.assignedToUserId || row.assigned_to_user_id || undefined,
    originalDelivererUserId: row.originalDelivererUserId || row.original_deliverer_user_id || '',
    correctionDeadline: row.correctionDeadline || row.correction_deadline || undefined,
    managerNotes: row.managerNotes || row.manager_notes || undefined,
    assignedAt: row.assignedAt ? new Date(row.assignedAt).toISOString() : undefined,
    assignedByUserId: row.assignedByUserId || row.assigned_by_user_id || undefined,
    reportedByName: row.reportedByName || undefined,
    assignedToName: row.assignedToName || undefined,
    originalDelivererName: row.originalDelivererName || undefined,
  };
}

export { verifyPassword, hashPassword };
