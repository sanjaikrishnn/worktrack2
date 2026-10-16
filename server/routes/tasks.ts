import { Router, Request, Response } from 'express';
import { pgDb, Task, TaskHistory, User, AuditLog, BugReport } from '../db.js';
import { requireAuth } from './auth.js';
import { eventBus } from '../events.js';
import crypto from 'crypto';

export const tasksRouter = Router();

// GET /api/tasks - List tasks based on role from PostgreSQL
tasksRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const tasks = await pgDb.getTasks(user.id, user.role);
    res.json({ tasks });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve tasks: ' + err.message });
  }
});

// GET /api/tasks/:id - Task details with submission history from PostgreSQL
tasksRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { id } = req.params;
    const task = await pgDb.getTaskById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Role-based visibility check
    if (user.role === 'employee' && task.assignedToUserId !== user.id && task.originalDeliveryUserId !== user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to view this task.' });
    }

    const history = await pgDb.getTaskHistory(task.id);

    res.json({
      task,
      history,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve task details: ' + err.message });
  }
});

// POST /api/tasks - Create task (Manager/Admin only) in PostgreSQL
tasksRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only managers can create tasks.' });
  }

  const { title, description, moduleName, assignedToUserId, deadline } = req.body;
  if (!title || !moduleName || !assignedToUserId || !deadline) {
    return res.status(400).json({ error: 'Title, module, assignee, and deadline are required.' });
  }

  try {
    const allTasks = await pgDb.getTasks();
    const nextNum = allTasks.length + 1;
    const taskId = `T-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newTaskData: Partial<Task> = {
      id: `tsk_${crypto.randomBytes(6).toString('hex')}`,
      taskId,
      title,
      description: description || '',
      moduleId: `mod_${moduleName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      moduleName,
      assignedToUserId,
      originalDeliveryUserId: assignedToUserId,
      createdByUserId: user.id,
      deadline,
      progress: 0,
      status: 'pending',
      qaStatus: 'Pending',
    };

    const createdTask = await pgDb.createTask(newTaskData);

    // Add status history
    await pgDb.addTaskHistory({
      id: `th_${crypto.randomBytes(6).toString('hex')}`,
      taskId: createdTask.id,
      previousStatus: '',
      newStatus: 'pending',
      changedByUserId: user.id,
      comment: `Task created and assigned to employee.`,
      timestamp: now,
    });

    // Send notification to assignee
    await pgDb.createNotification({
      id: `notif_${crypto.randomBytes(6).toString('hex')}`,
      userId: assignedToUserId,
      title: 'New Task Assigned',
      message: `You have been assigned task ${taskId}: "${title}". Deadline: ${deadline}.`,
      type: 'assignment',
      read: false,
      link: `/tasks/${taskId}`,
      createdAt: now,
    });

    // Audit log
    await pgDb.createAuditLog({
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      userId: user.id,
      userName: user.name,
      action: 'CREATE_TASK',
      entityType: 'task',
      entityId: taskId,
      details: `Created task ${taskId} assigned to employee.`,
      timestamp: now,
    });

    eventBus.broadcast('TASK_CREATED', { task: createdTask });

    res.status(201).json({ task: createdTask, message: 'Task created successfully in PostgreSQL.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create task: ' + err.message });
  }
});

// POST /api/tasks/:id/submit - Employee submits deliverable
tasksRouter.post('/:id/submit', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { submissionNotes, fileName } = req.body;

  try {
    const task = await pgDb.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (user.role === 'employee' && task.assignedToUserId !== user.id) {
      return res.status(403).json({ error: 'You are only authorized to submit work for tasks assigned to you.' });
    }

    const now = new Date().toISOString();
    const prevStatus = task.status;

    const updatedTask = await pgDb.updateTask(task.id, {
      status: 'completed',
      progress: 100,
      submissionFile: fileName || 'deliverable.zip',
      submissionNotes: submissionNotes || 'Work submitted for testing.',
      submittedAt: now,
      qaStatus: 'Pending',
    });

    // Add to task history in PostgreSQL
    await pgDb.addTaskHistory({
      id: `th_${crypto.randomBytes(6).toString('hex')}`,
      taskId: task.id,
      previousStatus: prevStatus,
      newStatus: 'completed',
      changedByUserId: user.id,
      comment: `Submission uploaded: ${fileName || 'deliverable.zip'}. Notes: ${submissionNotes || 'Delivered'}`,
      timestamp: now,
    });

    // Notify managers and testers
    const allUsers = await pgDb.getUsers();
    const managersAndTesters = allUsers.filter((u) => u.role === 'manager' || u.role === 'tester' || u.role === 'admin');
    for (const m of managersAndTesters) {
      await pgDb.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: m.id,
        title: 'Task Deliverable Submitted',
        message: `${user.name} submitted work for ${task.taskId} (${task.moduleName}). Ready for testing.`,
        type: 'fix_submitted',
        read: false,
        link: `/tasks/${task.taskId}`,
        createdAt: now,
      });
    }

    eventBus.broadcast('TASK_SUBMITTED', { task: updatedTask });

    res.json({ task: updatedTask, message: 'Work submitted successfully! Task marked as completed and sent for QA testing.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit task: ' + err.message });
  }
});

// POST /api/tasks/:id/verify - QA Tester verifies task deliverable (Pass or Fail) in PostgreSQL
tasksRouter.post('/:id/verify', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const {
    result,
    defectReason,
    defectDescription,
    severity,
    stepsToReproduce,
    expectedResult,
    actualResult,
    evidenceName,
  } = req.body;

  if (result !== 'PASS' && result !== 'FAIL') {
    return res.status(400).json({ error: 'Result must be either PASS or FAIL.' });
  }

  try {
    const task = await pgDb.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const now = new Date().toISOString();
    const prevStatus = task.status;
    const allUsers = await pgDb.getUsers();

    if (result === 'PASS') {
      const updatedTask = await pgDb.updateTask(task.id, {
        qaStatus: 'Pass',
        qaVerifiedAt: now,
        qaVerifiedByUserId: user.id,
        qaDefectReason: '',
        status: 'completed',
        progress: 100,
      });

      // Task status history
      await pgDb.addTaskHistory({
        id: `th_${crypto.randomBytes(6).toString('hex')}`,
        taskId: task.id,
        previousStatus: prevStatus,
        newStatus: 'completed',
        changedByUserId: user.id,
        comment: `QA Verification PASSED by ${user.name} (${user.role.toUpperCase()}). Deliverable approved for release.`,
        timestamp: now,
      });

      // Notify assigned employee & managers
      const recipientIds = new Set<string>();
      if (task.assignedToUserId && task.assignedToUserId !== user.id) recipientIds.add(task.assignedToUserId);
      if (task.originalDeliveryUserId && task.originalDeliveryUserId !== user.id) recipientIds.add(task.originalDeliveryUserId);
      allUsers.filter((u) => u.role === 'manager' || u.role === 'admin').forEach((m) => {
        if (m.id !== user.id) recipientIds.add(m.id);
      });

      for (const rId of recipientIds) {
        await pgDb.createNotification({
          id: `notif_${crypto.randomBytes(6).toString('hex')}`,
          userId: rId,
          title: `QA Passed: ${task.taskId}`,
          message: `${user.name} verified and approved ${task.moduleName} (${task.taskId}). Module passed QA inspection.`,
          type: 'fix_approved',
          read: false,
          link: `/tasks/${task.taskId}`,
          createdAt: now,
        });
      }

      await pgDb.createAuditLog({
        id: `aud_${crypto.randomBytes(6).toString('hex')}`,
        userId: user.id,
        userName: user.name,
        action: 'QA_VERIFICATION_PASS',
        entityType: 'task',
        entityId: task.taskId,
        details: `QA verification PASSED for ${task.taskId} (${task.moduleName}).`,
        timestamp: now,
      });

      eventBus.broadcast('TASK_QA_VERIFIED', { task: updatedTask, qaStatus: 'Pass' });
      eventBus.broadcast('TASK_UPDATED', { task: updatedTask });

      return res.json({
        success: true,
        task: updatedTask,
        message: `QA Verification PASSED: Task ${task.taskId} (${task.moduleName}) passed inspection.`,
      });
    } else {
      // FAIL workflow: requires defect reason, creates linked bug in PostgreSQL, and reopens task
      if (!defectReason || !defectReason.trim()) {
        return res.status(400).json({ error: 'A defect reason is required when marking QA verification as FAIL.' });
      }

      const updatedTask = await pgDb.updateTask(task.id, {
        qaStatus: 'Fail',
        qaVerifiedAt: now,
        qaVerifiedByUserId: user.id,
        qaDefectReason: defectReason.trim(),
        status: 'reopened',
        progress: Math.min(task.progress, 50),
      });

      // Create linked bug report in PostgreSQL
      const allBugs = await pgDb.getBugs();
      const nextNum = allBugs.length + 1;
      const bugId = `BUG-${String(nextNum).padStart(3, '0')}`;
      const originalDelivererUserId = task.originalDeliveryUserId || task.assignedToUserId;

      const newBug = await pgDb.createBug({
        id: `bug_${crypto.randomBytes(6).toString('hex')}`,
        bugId,
        title: defectReason.trim(),
        description: defectDescription?.trim() || `QA Verification Failed: ${defectReason.trim()}`,
        stepsToReproduce: stepsToReproduce?.trim() || '1. Download deliverable build\n2. Perform QA inspection\n3. Observed defect during verification',
        expectedResult: expectedResult?.trim() || 'Module must pass QA functional test specifications without defects.',
        actualResult: actualResult?.trim() || defectReason.trim(),
        severity: severity || 'High',
        evidenceName: evidenceName || 'qa_defect_evidence.png',
        evidenceUrl: '/uploads/error-screenshot.png',
        taskId: task.id,
        moduleId: task.moduleId,
        moduleName: task.moduleName,
        reportedByUserId: user.id,
        status: 'reported',
        originalDelivererUserId,
        assignedToUserId: task.assignedToUserId, // Route to deliverer for corrective rework
      });

      // Record task history
      await pgDb.addTaskHistory({
        id: `th_${crypto.randomBytes(6).toString('hex')}`,
        taskId: task.id,
        previousStatus: prevStatus,
        newStatus: 'reopened',
        changedByUserId: user.id,
        comment: `QA Verification FAILED by ${user.name}: "${defectReason.trim()}". Defect ${bugId} created and task reopened for corrective rework.`,
        timestamp: now,
      });

      // Notifications to assigned employee & manager
      const recipientIds = new Set<string>();
      if (task.assignedToUserId && task.assignedToUserId !== user.id) recipientIds.add(task.assignedToUserId);
      if (task.originalDeliveryUserId && task.originalDeliveryUserId !== user.id) recipientIds.add(task.originalDeliveryUserId);
      allUsers.filter((u) => u.role === 'manager' || u.role === 'admin').forEach((m) => {
        if (m.id !== user.id) recipientIds.add(m.id);
      });

      for (const rId of recipientIds) {
        await pgDb.createNotification({
          id: `notif_${crypto.randomBytes(6).toString('hex')}`,
          userId: rId,
          title: `QA Failed: ${task.taskId} (${bugId})`,
          message: `QA inspection FAILED on ${task.moduleName} (${task.taskId}). Defect ${bugId} logged: "${defectReason.trim()}". Corrective rework workflow triggered.`,
          type: 'bug_reported',
          read: false,
          link: `/tasks/${task.taskId}`,
          createdAt: now,
        });
      }

      await pgDb.createAuditLog({
        id: `aud_${crypto.randomBytes(6).toString('hex')}`,
        userId: user.id,
        userName: user.name,
        action: 'QA_VERIFICATION_FAIL',
        entityType: 'task',
        entityId: task.taskId,
        details: `QA verification FAILED for ${task.taskId} (${task.moduleName}). Defect ${bugId} created: ${defectReason.trim()}`,
        timestamp: now,
      });

      eventBus.broadcast('TASK_QA_VERIFIED', { task: updatedTask, qaStatus: 'Fail', bug: newBug });
      eventBus.broadcast('BUG_REPORTED', { bug: newBug, task: updatedTask });
      eventBus.broadcast('TASK_UPDATED', { task: updatedTask });

      return res.status(201).json({
        success: true,
        task: updatedTask,
        bug: newBug,
        message: `QA Verification FAILED: Defect ${bugId} created and corrective workflow triggered.`,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify task: ' + err.message });
  }
});
