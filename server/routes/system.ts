import { Router, Request, Response } from 'express';
import { pgDb, User } from '../db.js';
import { getDbStats } from '../pg.js';
import { requireAuth } from './auth.js';
import { eventBus } from '../events.js';
import crypto from 'crypto';

export const systemRouter = Router();

// SSE connection for live synchronization
systemRouter.get('/events', (req: Request, res: Response) => {
  const clientId = `client_${crypto.randomBytes(6).toString('hex')}`;
  const userId = req.query.userId as string | undefined;
  eventBus.addClient(clientId, res, userId);
});

// Notifications from PostgreSQL
systemRouter.get('/notifications', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  try {
    const notifications = await pgDb.getNotifications(user.id);
    res.json({ notifications });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve notifications: ' + err.message });
  }
});

systemRouter.post('/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  try {
    await pgDb.markNotificationRead(id, user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notification read: ' + err.message });
  }
});

systemRouter.post('/notifications/read-all', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  try {
    await pgDb.markAllNotificationsRead(user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark all read: ' + err.message });
  }
});

// Audit logs from PostgreSQL (Manager/Admin only)
systemRouter.get('/audit-logs', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Manager access required.' });
  }
  try {
    const logs = await pgDb.getAuditLogs();
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve audit logs: ' + err.message });
  }
});

// Database connectivity and live statistics endpoint
systemRouter.get('/database/status', async (req: Request, res: Response) => {
  try {
    const stats = await getDbStats();
    res.json({
      status: 'ok',
      database: 'PostgreSQL',
      ...stats,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Database reset / clear
systemRouter.post('/database/clear', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required.' });
  }
  try {
    eventBus.broadcast('DATA_RESET', {});
    res.json({ success: true, message: 'Database reset successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset database: ' + err.message });
  }
});
