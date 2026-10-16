import { Router, Request, Response } from 'express';
import { pgDb, WorkSession, FixSubmission, CorrectiveTimeEntry, User, BugReport } from '../db.js';
import { requireAuth } from './auth.js';
import { eventBus } from '../events.js';
import crypto from 'crypto';

export const reworkRouter = Router();

// Helper to calculate total active elapsed seconds authoritatively from server timestamps
function getSessionElapsedSeconds(session: WorkSession): number {
  let elapsed = session.accumulatedSeconds || 0;
  if (session.isRunning && session.startedAt) {
    const activeSpan = Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000));
    elapsed += activeSpan;
  }
  return elapsed;
}

// GET /api/rework/session/:bugId - Get active timer session for a bug from PostgreSQL
reworkRouter.get('/session/:bugId', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { bugId } = req.params;

  try {
    const bug = await pgDb.getBugById(bugId);
    const resolvedBugId = bug ? bug.bugId : bugId;

    const session = await pgDb.getWorkSession(resolvedBugId, user.id);

    if (!session) {
      return res.json({ session: null, elapsedSeconds: 0, isRunning: false });
    }

    const elapsedSeconds = getSessionElapsedSeconds(session);
    res.json({ session, elapsedSeconds, isRunning: session.isRunning });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve work session: ' + err.message });
  }
});

// POST /api/rework/timer/start - Start or resume server-authoritative timer in PostgreSQL
reworkRouter.post('/timer/start', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { bugId } = req.body;

  if (!bugId) {
    return res.status(400).json({ error: 'Bug ID is required.' });
  }

  try {
    const bug = await pgDb.getBugById(bugId);
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found.' });
    }

    if (user.role === 'employee' && bug.assignedToUserId !== user.id) {
      return res.status(403).json({ error: 'You are not assigned to fix this bug.' });
    }

    const now = new Date().toISOString();
    let session = await pgDb.getWorkSession(bug.bugId, user.id);

    if (!session) {
      session = {
        id: `ws_${crypto.randomBytes(6).toString('hex')}`,
        bugId: bug.bugId,
        employeeId: user.id,
        startedAt: now,
        accumulatedSeconds: 0,
        isRunning: true,
        lastHeartbeatAt: now,
        updatedAt: now,
      };
    } else {
      // Resume if not running
      if (!session.isRunning) {
        session.startedAt = now;
        session.isRunning = true;
      }
      session.lastHeartbeatAt = now;
      session.updatedAt = now;
    }

    await pgDb.saveWorkSession(session);

    // Update bug status in PostgreSQL to in_progress if assigned or changes_requested
    if (bug.status === 'assigned' || bug.status === 'changes_requested') {
      await pgDb.updateBug(bug.id, { status: 'in_progress' });
    }

    // Audit log
    await pgDb.createAuditLog({
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      userId: user.id,
      userName: user.name,
      action: 'START_TIMER',
      entityType: 'work_session',
      entityId: bug.bugId,
      details: `Started corrective work timer for ${bug.bugId}.`,
      timestamp: now,
    });

    const elapsedSeconds = getSessionElapsedSeconds(session);
    res.json({ session, elapsedSeconds, isRunning: true, message: 'Timer started and persisted to PostgreSQL.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to start timer: ' + err.message });
  }
});

// POST /api/rework/timer/pause - Pause timer and persist accumulated duration
reworkRouter.post('/timer/pause', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { bugId } = req.body;

  try {
    const bug = await pgDb.getBugById(bugId);
    const resolvedBugId = bug ? bug.bugId : bugId;

    const session = await pgDb.getWorkSession(resolvedBugId, user.id);
    if (!session) {
      return res.status(404).json({ error: 'No active session found.' });
    }

    if (session.isRunning && session.startedAt) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000));
      session.accumulatedSeconds += elapsed;
      session.isRunning = false;
      session.startedAt = null;
      session.updatedAt = new Date().toISOString();
      await pgDb.saveWorkSession(session);
    }

    res.json({ session, elapsedSeconds: session.accumulatedSeconds, isRunning: false, message: 'Timer paused.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to pause timer: ' + err.message });
  }
});

// POST /api/rework/submit-fix - Submit fix for manager review in PostgreSQL
reworkRouter.post('/submit-fix', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { bugId, fixDescription, progressPercentage, fixFile, notes } = req.body;

  if (!bugId || !fixDescription) {
    return res.status(400).json({ error: 'Bug ID and fix description are required.' });
  }

  try {
    const bug = await pgDb.getBugById(bugId);
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found.' });
    }

    if (user.role === 'employee' && bug.assignedToUserId !== user.id) {
      return res.status(403).json({ error: 'Forbidden. You are not the assigned fixer.' });
    }

    const now = new Date().toISOString();

    // Stop session timer and compute final server duration
    const session = await pgDb.getWorkSession(bug.bugId, user.id);
    let finalSeconds = 9360; // default 2h 36m if no timer session was started
    if (session) {
      finalSeconds = getSessionElapsedSeconds(session);
      session.isRunning = false;
      session.accumulatedSeconds = finalSeconds;
      session.startedAt = null;
      session.updatedAt = now;
      await pgDb.saveWorkSession(session);
    }

    // Format hours and calculate financial cost
    const hours = Math.floor(finalSeconds / 3600);
    const minutes = Math.floor((finalSeconds % 3600) / 60);
    const hoursDisplay = `${hours}h ${minutes}m`;
    const decimalHours = parseFloat((finalSeconds / 3600).toFixed(2));
    const rate = user.hourlyRate || 300;
    const calculatedCost = Math.round(decimalHours * rate);

    // Update bug status in PostgreSQL to ready_for_review
    await pgDb.updateBug(bug.id, { status: 'ready_for_review' });

    // Insert fix submission in PostgreSQL
    const newSubmission: FixSubmission = {
      id: `fix_${crypto.randomBytes(6).toString('hex')}`,
      bugId: bug.bugId,
      taskId: bug.taskId,
      employeeId: user.id,
      fixDescription,
      progressPercentage: Number(progressPercentage) || 100,
      status: 'submitted',
      fixFile: fixFile || 'fix_v1.1.zip',
      notes: notes || 'Fix submitted for review.',
      timeSpentSeconds: finalSeconds,
      submittedAt: now,
    };
    await pgDb.createFixSubmission(newSubmission);

    // Create or update CorrectiveTimeEntry in PostgreSQL
    const entries = await pgDb.getCorrectiveEntries(user.id);
    const existingEntry = entries.find((e) => e.bugId === bug.bugId);

    const formattedDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

    const timeEntry: CorrectiveTimeEntry = {
      id: existingEntry ? existingEntry.id : `cte_${crypto.randomBytes(6).toString('hex')}`,
      bugId: bug.bugId,
      taskId: bug.taskId,
      moduleName: bug.moduleName,
      employeeId: user.id,
      hoursSpent: decimalHours,
      hoursDisplay,
      hourlyRate: rate,
      calculatedCost,
      proposedDeduction: calculatedCost,
      status: 'pending',
      entryDate: formattedDate,
    };

    if (existingEntry) {
      await pgDb.updateCorrectiveEntry(existingEntry.id, {
        hoursSpent: decimalHours,
        hoursDisplay,
        calculatedCost,
        proposedDeduction: calculatedCost,
        status: 'pending',
      });
    } else {
      await pgDb.createCorrectiveEntry(timeEntry);
    }

    // Notify managers in PostgreSQL
    const allUsers = await pgDb.getUsers();
    const managers = allUsers.filter((u) => u.role === 'manager' || u.role === 'admin');
    for (const m of managers) {
      await pgDb.createNotification({
        id: `notif_${crypto.randomBytes(6).toString('hex')}`,
        userId: m.id,
        title: 'Fix Submitted for Review',
        message: `${user.name} submitted a fix for ${bug.bugId} (${bug.moduleName}) with ${hoursDisplay} corrective work logged.`,
        type: 'fix_submitted',
        read: false,
        link: `/manager/progress`,
        createdAt: now,
      });
    }

    // Audit log
    await pgDb.createAuditLog({
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      userId: user.id,
      userName: user.name,
      action: 'SUBMIT_FIX',
      entityType: 'fix_submission',
      entityId: bug.bugId,
      details: `Submitted fix for ${bug.bugId}. Total time: ${hoursDisplay}, Cost: ₹${calculatedCost}.`,
      timestamp: now,
    });

    eventBus.broadcast('FIX_SUBMITTED', { submission: newSubmission, bug, timeEntry });

    res.json({
      success: true,
      message: 'Fix submitted successfully! Your rework hours have been recorded for manager review.',
      confirmation: {
        bugId: bug.bugId,
        taskId: bug.taskId,
        timeSpent: hoursDisplay,
        submissionDate: new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
        status: 'Submitted',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit fix: ' + err.message });
  }
});
