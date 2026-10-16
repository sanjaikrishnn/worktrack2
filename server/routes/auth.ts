import { Router, Request, Response, NextFunction } from 'express';
import { pgDb, verifyPassword, hashPassword, User } from '../db.js';
import { query } from '../pg.js';
import crypto from 'crypto';

export const authRouter = Router();

// Fast local cache + PostgreSQL persistent sessions
const sessions = new Map<string, { userId: string; expiresAt: number }>();

export async function getSessionUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // 1. Check local cache
  const cached = sessions.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    const user = await pgDb.getUserById(cached.userId);
    return user && user.active ? user : null;
  }

  // 2. Authoritative lookup in PostgreSQL auth_sessions table
  try {
    const res = await query<{ user_id: string; expires_at: string }>(
      'SELECT user_id, expires_at FROM auth_sessions WHERE token = $1;',
      [token]
    );

    if (res.rows.length === 0) {
      sessions.delete(token);
      return null;
    }

    const row = res.rows[0];
    const expTime = new Date(row.expires_at).getTime();
    if (expTime < Date.now()) {
      await query('DELETE FROM auth_sessions WHERE token = $1;', [token]);
      sessions.delete(token);
      return null;
    }

    // Cache valid session
    sessions.set(token, { userId: row.user_id, expiresAt: expTime });

    const user = await pgDb.getUserById(row.user_id);
    return user && user.active ? user : null;
  } catch (err: any) {
    console.warn('Session verification fallback error:', err.message);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to continue.' });
    }
    (req as any).user = user;
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Authentication verification error: ' + err.message });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden. Role '${user.role}' does not have access.` });
    }
    next();
  };
}

// POST /api/auth/register - Create employee/tester/manager account in PostgreSQL
authRouter.post('/register', async (req: Request, res: Response) => {
  const { name, email, empId, password, role } = req.body;

  if (!name || !email || !empId || !password) {
    return res.status(400).json({ error: 'Full Name, Work Email, Employee ID, and Password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const validRoles = ['employee', 'tester', 'manager'];
  const userRole = validRoles.includes(role?.toLowerCase()) ? role.toLowerCase() : 'employee';

  try {
    // Check if user with email or empId already exists
    const existing = await pgDb.findUserByIdentifier(email);
    const existingEmp = await pgDb.findUserByIdentifier(empId);
    if (existing || existingEmp) {
      return res.status(400).json({ error: 'An account with this Email or Employee ID already exists.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();

    const department =
      userRole === 'tester'
        ? 'QA & Testing'
        : userRole === 'manager'
        ? 'Engineering Management'
        : 'IT / Engineering';

    const designation =
      userRole === 'tester'
        ? 'QA Test Engineer'
        : userRole === 'manager'
        ? 'Engineering Manager'
        : 'Software Engineer';

    const hourlyRate = userRole === 'tester' ? 280 : userRole === 'manager' ? 500 : 300;

    const newUser: User = {
      id: userId,
      empId: empId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      role: userRole as any,
      department,
      designation,
      hourlyRate,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      active: true,
      createdAt: now,
    };

    await pgDb.createUser(newUser);

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
      await query(
        'INSERT INTO auth_sessions (token, user_id, expires_at) VALUES ($1, $2, $3);',
        [token, newUser.id, expiresAt.toISOString()]
      );
    } catch (e: any) {
      console.warn('Could not persist session to auth_sessions:', e.message);
    }
    sessions.set(token, { userId: newUser.id, expiresAt: expiresAt.getTime() });

    const { passwordHash: _, salt: __, ...safeUser } = newUser;

    res.status(201).json({
      token,
      user: safeUser,
      message: 'Account created successfully! Welcome to WorkTrack.',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account: ' + err.message });
  }
});

// POST /api/auth/login - Authenticate real employee against PostgreSQL
authRouter.post('/login', async (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/Employee ID and password are required.' });
  }

  try {
    const user = await pgDb.findUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid Employee ID/Email or password.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'This account has been deactivated. Contact your manager.' });
    }

    // If password hash is missing, account requires setup/activation
    if (!user.passwordHash || !user.salt) {
      return res.status(400).json({
        requiresActivation: true,
        error: 'Account requires initial password setup. Please activate your account.',
      });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Employee ID/Email or password.' });
    }

    // Role verification: role is authoritative from PostgreSQL database
    if (role && role !== 'auto' && user.role.toLowerCase() !== role.toLowerCase() && user.role !== 'admin') {
      return res.status(403).json({
        error: `Your account is registered as '${user.role}', not '${role}'. Please switch to the correct role.`,
      });
    }

    // Create persistent session token in PostgreSQL (7 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    try {
      await query(
        'INSERT INTO auth_sessions (token, user_id, expires_at) VALUES ($1, $2, $3);',
        [token, user.id, expiresAt.toISOString()]
      );
    } catch (e: any) {
      console.warn('Could not persist session to auth_sessions:', e.message);
    }
    sessions.set(token, { userId: user.id, expiresAt: expiresAt.getTime() });

    // Exclude password hash and salt from response
    const { passwordHash, salt, ...safeUser } = user;

    res.json({
      token,
      user: safeUser,
      message: 'Login successful',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

// POST /api/auth/activate - Password setup / account activation for real employees
authRouter.post('/activate', async (req: Request, res: Response) => {
  const { identifier, newPassword } = req.body;

  if (!identifier || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Employee ID/Email and a secure password (min 6 characters) are required.' });
  }

  try {
    const user = await pgDb.findUserByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ error: 'Employee record not found in PostgreSQL database.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    await pgDb.updateUserPassword(user.id, hash, salt);

    res.json({
      success: true,
      message: `Password successfully set for ${user.name}. You may now log in with your credentials.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to activate account: ' + err.message });
  }
});

// GET /api/auth/me - Current authenticated user
authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { passwordHash, salt, ...safeUser } = user;
  res.json({ user: safeUser });
});

// POST /api/auth/logout
authRouter.post('/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    sessions.delete(token);
    try {
      await query('DELETE FROM auth_sessions WHERE token = $1;', [token]);
    } catch {}
  }
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/verify-rework-access - Re-authentication for Rework Module access
authRouter.post('/verify-rework-access', requireAuth, async (req: Request, res: Response) => {
  const currentUser = (req as any).user as User;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required to access Rework Module.' });
  }

  try {
    const user = await pgDb.getUserById(currentUser.id);
    if (!user || !user.passwordHash || !user.salt) {
      return res.status(401).json({ error: 'Authentication verification failed.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password. Access denied.' });
    }

    res.json({
      verified: true,
      message: 'Authentication successful. Corrective time tracking enabled.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Verification error: ' + err.message });
  }
});

// GET /api/auth/users - List real employees from PostgreSQL for task/bug assignment
authRouter.get('/users', requireAuth, async (req: Request, res: Response) => {
  try {
    const users = await pgDb.getUsers();
    const safeUsers = users.map(({ passwordHash, salt, ...u }) => u);
    res.json({ users: safeUsers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load employees: ' + err.message });
  }
});
