import { Router, Request, Response } from 'express';
import { pgDb, BugReport, Task, User, AuditLog, CorrectiveTimeEntry } from '../db.js';
import { requireAuth } from './auth.js';
import { eventBus } from '../events.js';
import crypto from 'crypto';

export const bugsRouter = Router();

// GET /api/bugs - List bugs with role-based visibility from PostgreSQL
bugsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const bugs = await pgDb.getBugs(user.id, user.role);
    res.json({ bugs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve bug reports: ' + err.message });
  }
});

// GET /api/bugs/:id - Bug details from PostgreSQL
bugsRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { id } = req.params;
    const bug = await pgDb.getBugById(id);

    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found.' });
    }

    // Role-based authorization
    if (user.role === 'employee' && bug.assignedToUserId !== user.id && bug.originalDelivererUserId !== user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not have access to this bug report.' });
    }

    const linkedTask = bug.taskId ? await pgDb.getTaskById(bug.taskId) : null;

    res.json({
      bug: {
        ...bug,
        taskDisplayId: linkedTask ? linkedTask.taskId : bug.taskId,
        taskTitle: linkedTask ? linkedTask.title : '',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve bug details: ' + err.message });
  }
});

// POST /api/bugs - Reporter/Tester creates a bug report in PostgreSQL
bugsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { title, description, stepsToReproduce, expectedResult, actualResult, severity, taskId, moduleName, evidenceName } = req.body;

  if (!title || !description || !severity) {
    return res.status(400).json({ error: 'Title, description, and severity are required.' });
  }

  try {
    const task = taskId ? await pgDb.getTaskById(taskId) : null;
    const allBugs = await pgDb.getBugs();
    const nextNum = allBugs.length + 1;
    const bugId = `BUG-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const originalDelivererUserId = task ? task.originalDeliveryUserId || task.assignedToUserId : user.id;
    const resolvedModuleName = moduleName || (task ? task.moduleName : 'General');
    const resolvedTaskId = task ? task.id : taskId || 'unlinked';

    const newBug = await pgDb.createBug({
      id: `bug_${crypto.randomBytes(6).toString('hex')}`,
      bugId,
      title,
      description,
      stepsToReproduce: stepsToReproduce || '',
      expectedResult: expectedResult || '',
      actualResult: actualResult || '',
      severity: severity || 'Medium',
      evidenceName: evidenceName || (req.body.hasEvidence ? 'defect-evidence.png' : undefined),
      evidenceUrl: req.body.hasEvidence ? '/uploads/defect-evidence.png' : undefined,
      taskId: resolvedTaskId,
      moduleId: task?.moduleId || null,
      moduleName: resolvedModuleName,
      reportedByUserId: user.id,
      status: 'reported',
      originalDelivererUserId,
    });

    // If linked to a completed or in_progress task, reopen task in PostgreSQL
    if (task && (task.status === 'completed' || task.status === 'in_progress')) {
      const prevStatus = task.status;
      await pgDb.updateTask(task.id, {
        status: 'reopened',
        progress: Math.min(task.progress, 60),
        qaStatus: 'Fail',
        qaDefectReason: title,
      });

      await pgDb.addTaskHistory({
        id: `th_${crypto.randomBytes(6).toString('hex')}`,
        taskId: task.id,
        previousStatus: prevStatus,
        newStatus: 'reopened',
        changedByUserId: user.id,
        comment: `Task reopened due to defect ${bugId}: "${title}" reported by QA.`,
        timestamp: now,
      });
    }

    // Notify managers in PostgreSQL
    const allUsers = await pgDb.getUsers();
    const managers = allUsers.filter((u) => u.role === 'manager' || u.role === 'admin');
    for (const m of managers) {
      await pgDb.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: m.id,
        title: 'New Bug Reported',
        message: `${user.name} reported ${bugId} (${title}) in ${resolvedModuleName}. Requires review and assignment.`,
        type: 'bug_reported',
        read: false,
        link: `/manager/bug-review/${bugId}`,
        createdAt: now,
      });
    }

    // Audit log
    await pgDb.createAuditLog({
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      userId: user.id,
      userName: user.name,
      action: 'REPORT_BUG',
      entityType: 'bug',
      entityId: bugId,
      details: `Defect ${bugId} reported on task ${task ? task.taskId : resolvedTaskId} with severity ${severity}.`,
      timestamp: now,
    });

    eventBus.broadcast('BUG_REPORTED', { bug: newBug, task });

    res.status(201).json({ bug: newBug, message: 'Bug reported successfully! Manager notified for assignment.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create bug report: ' + err.message });
  }
});

// POST /api/bugs/:id/assign - Manager assigns bug, sets correction deadline
bugsRouter.post('/:id/assign', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only managers can assign bugs or set deadlines.' });
  }

  const { id } = req.params;
  const { assignedToUserId, correctionDeadline, managerNotes } = req.body;

  try {
    const bug = await pgDb.getBugById(id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found.' });
    }

    const now = new Date().toISOString();
    const previousAssigneeId = bug.assignedToUserId;
    const previousDeadline = bug.correctionDeadline;

    const updatedBug = await pgDb.updateBug(bug.id, {
      assignedToUserId,
      correctionDeadline: correctionDeadline || bug.correctionDeadline,
      managerNotes: managerNotes !== undefined ? managerNotes : bug.managerNotes,
      assignedByUserId: user.id,
      assignedAt: now,
      status: bug.status === 'reported' ? 'assigned' : bug.status,
    });

    const allUsers = await pgDb.getUsers();
    const newAssignee = allUsers.find((u) => u.id === assignedToUserId);

    // Notification to new assignee
    if (assignedToUserId) {
      await pgDb.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: assignedToUserId,
        title: 'Bug Assigned for Fixing',
        message: `You have been assigned ${bug.bugId} (${bug.title}). Correction deadline: ${correctionDeadline || bug.correctionDeadline}.`,
        type: 'assignment',
        read: false,
        link: `/bug-fixing/${bug.bugId}`,
        createdAt: now,
      });
    }

    // If re-assigned from previous assignee, notify previous assignee
    if (previousAssigneeId && previousAssigneeId !== assignedToUserId) {
      await pgDb.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: previousAssigneeId,
        title: 'Bug Reassigned',
        message: `${bug.bugId} has been reassigned to ${newAssignee ? newAssignee.name : 'another engineer'}.`,
        type: 'assignment',
        read: false,
        link: '/employee/dashboard',
        createdAt: now,
      });
    }

    // If deadline changed, notify assignee
    if (previousDeadline && previousDeadline !== correctionDeadline && assignedToUserId) {
      await pgDb.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: assignedToUserId,
        title: 'Correction Deadline Updated',
        message: `Correction deadline for ${bug.bugId} changed to ${correctionDeadline}.`,
        type: 'deadline',
        read: false,
        link: `/bug-fixing/${bug.bugId}`,
        createdAt: now,
      });
    }

    // Audit log
    await pgDb.createAuditLog({
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      userId: user.id,
      userName: user.name,
      action: 'ASSIGN_BUG',
      entityType: 'bug',
      entityId: bug.bugId,
      details: `Assigned ${bug.bugId} to ${newAssignee ? newAssignee.name : assignedToUserId} with deadline ${correctionDeadline}. Notes: ${managerNotes || 'none'}.`,
      timestamp: now,
    });

    eventBus.broadcast('BUG_ASSIGNED', { bug: updatedBug, previousAssigneeId, newAssigneeId: assignedToUserId });

    res.json({ bug: updatedBug, message: `Bug ${bug.bugId} assigned successfully to ${newAssignee ? newAssignee.name : 'engineer'}.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to assign bug: ' + err.message });
  }
});

// POST /api/bugs/:id/review - Manager reviews submitted fix (Approve or Request Changes)
bugsRouter.post('/:id/review', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only managers can review fix submissions.' });
  }

  const { id } = req.params;
  const { decision, reviewNotes } = req.body; // 'approve' | 'request_changes' | 'reject'

  if (!decision || !['approve', 'request_changes', 'reject'].includes(decision)) {
    return res.status(400).json({ error: "Decision must be 'approve', 'request_changes', or 'reject'." });
  }

  try {
    const bug = await pgDb.getBugById(id);
    if (!bug) {
      return res.status(404).json({ error: 'Bug report not found.' });
    }

    const now = new Date().toISOString();

    if (decision === 'approve') {
      const updatedBug = await pgDb.updateBug(bug.id, { status: 'approved' });

      // Mark fix submission approved in PostgreSQL
      await pgDb.updateFixSubmission(bug.bugId, {
        status: 'approved',
        reviewedByUserId: user.id,
        reviewNotes: reviewNotes || 'Fix verified and approved.',
        reviewedAt: now,
      });

      // Update corrective time entry for payroll eligibility in PostgreSQL
      const entries = await pgDb.getCorrectiveEntries(bug.assignedToUserId);
      const existingEntry = entries.find((te) => te.bugId === bug.bugId);
      if (existingEntry) {
        await pgDb.updateCorrectiveEntry(existingEntry.id, {
          status: 'approved',
          proposedDeduction: existingEntry.calculatedCost,
          approvedByUserId: user.id,
          approvedAt: now,
        });
      }

      // Notify employee
      if (bug.assignedToUserId) {
        await pgDb.createNotification({
          id: `notif_${crypto.randomBytes(6).toString('hex')}`,
          userId: bug.assignedToUserId,
          title: 'Bug Fix Approved!',
          message: `Your fix for ${bug.bugId} has been verified and approved by ${user.name}.`,
          type: 'fix_approved',
          read: false,
          link: `/salary-rework`,
          createdAt: now,
        });
      }

      await pgDb.createAuditLog({
        id: `aud_${crypto.randomBytes(6).toString('hex')}`,
        userId: user.id,
        userName: user.name,
        action: 'APPROVE_FIX',
        entityType: 'bug',
        entityId: bug.bugId,
        details: `Approved fix for ${bug.bugId}. Notes: ${reviewNotes || 'Approved'}.`,
        timestamp: now,
      });

      eventBus.broadcast('BUG_REVIEWED', { bug: updatedBug, decision, reviewNotes });

      return res.json({ bug: updatedBug, message: 'Fix approved and eligible for payroll review.' });
    } else if (decision === 'request_changes') {
      const updatedBug = await pgDb.updateBug(bug.id, { status: 'changes_requested' });

      await pgDb.updateFixSubmission(bug.bugId, {
        status: 'changes_requested',
        reviewedByUserId: user.id,
        reviewNotes: reviewNotes || 'Please address the requested changes.',
        reviewedAt: now,
      });

      if (bug.assignedToUserId) {
        await pgDb.createNotification({
          id: `notif_${crypto.randomBytes(6).toString('hex')}`,
          userId: bug.assignedToUserId,
          title: 'Changes Requested on Fix',
          message: `Manager requested changes for ${bug.bugId}: "${reviewNotes || 'Review comments provided'}".`,
          type: 'changes_requested',
          read: false,
          link: `/bug-fixing/${bug.bugId}`,
          createdAt: now,
        });
      }

      await pgDb.createAuditLog({
        id: `aud_${crypto.randomBytes(6).toString('hex')}`,
        userId: user.id,
        userName: user.name,
        action: 'REQUEST_CHANGES',
        entityType: 'bug',
        entityId: bug.bugId,
        details: `Changes requested on ${bug.bugId}. Comment: ${reviewNotes || 'None'}.`,
        timestamp: now,
      });

      eventBus.broadcast('BUG_REVIEWED', { bug: updatedBug, decision, reviewNotes });

      return res.json({ bug: updatedBug, message: 'Changes requested. Employee has been notified.' });
    } else {
      const updatedBug = await pgDb.updateBug(bug.id, { status: 'rejected' });
      eventBus.broadcast('BUG_REVIEWED', { bug: updatedBug, decision, reviewNotes });
      return res.json({ bug: updatedBug, message: 'Bug fix rejected.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to review bug fix: ' + err.message });
  }
});
