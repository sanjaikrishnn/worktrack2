import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

let pgPool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isExternal = false;
let isInitialized = false;
let connectionError: string | null = null;

// Password hashing utilities using PBKDF2-SHA512 matching dataset
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computed === hash;
}

export async function getDb(): Promise<{
  query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
  exec: (sql: string) => Promise<void>;
  isExternal: boolean;
}> {
  if (isInitialized && (pgPool || pgliteInstance)) {
    return {
      query: runQuery,
      exec: runExec,
      isExternal,
    };
  }

  await initDatabase();
  return {
    query: runQuery,
    exec: runExec,
    isExternal,
  };
}

let initPromise: Promise<void> | null = null;

function cleanupStaleLocks(dataDir: string) {
  if (!fs.existsSync(dataDir)) return;
  const lockFiles = ['postmaster.pid', 'postmaster.opts'];
  for (const file of lockFiles) {
    const fullPath = path.resolve(dataDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🧹 Cleaned up stale ${file} lock file`);
      } catch (e: any) {
        console.warn(`Failed to remove ${file}:`, e.message);
      }
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (pgPool) {
    try { await pgPool.end(); } catch {}
    pgPool = null;
  }
  if (pgliteInstance) {
    try { await pgliteInstance.close(); } catch {}
    pgliteInstance = null;
  }
  const dataDir = path.resolve(process.cwd(), 'data', 'postgres_data');
  cleanupStaleLocks(dataDir);
  isInitialized = false;
  initPromise = null;
}

async function resetEngine(): Promise<void> {
  console.warn('⚠️ Initiating PostgreSQL engine recovery...');
  try {
    if (pgliteInstance) {
      try { await pgliteInstance.close(); } catch {}
      pgliteInstance = null;
    }
    const dataDir = path.resolve(process.cwd(), 'data', 'postgres_data');
    cleanupStaleLocks(dataDir);
  } catch (err: any) {
    console.warn('Warning during storage cleanup:', err.message);
  }
  isInitialized = false;
  initPromise = null;
  await initDatabase();
}

async function runQuery<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  if (pgPool) {
    const res = await pgPool.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
  } else if (pgliteInstance) {
    try {
      const res = await pgliteInstance.query(text, params);
      return { rows: res.rows as T[], rowCount: res.rows.length };
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      if (errMsg.includes('Aborted') || err?.name === 'RuntimeError') {
        console.warn('⚠️ PGlite aborted, recovering database engine...');
        await resetEngine();
        if (pgliteInstance) {
          const retryRes = await pgliteInstance.query(text, params);
          return { rows: retryRes.rows as T[], rowCount: retryRes.rows.length };
        }
      }
      throw err;
    }
  }
  throw new Error('PostgreSQL database is not initialized.');
}

async function runExec(sql: string): Promise<void> {
  if (pgPool) {
    await pgPool.query(sql);
  } else if (pgliteInstance) {
    try {
      await pgliteInstance.exec(sql);
    } catch (err: any) {
      const errMsg = String(err?.message || err);
      if (errMsg.includes('Aborted') || err?.name === 'RuntimeError') {
        console.warn('⚠️ PGlite aborted during exec, recovering database engine...');
        await resetEngine();
        if (pgliteInstance) {
          await pgliteInstance.exec(sql);
          return;
        }
      }
      throw err;
    }
  } else {
    throw new Error('PostgreSQL database is not initialized.');
  }
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  if (!isInitialized) {
    await initDatabase();
  }
  return runQuery<T>(text, params);
}

export async function exec(sql: string): Promise<void> {
  if (!isInitialized) {
    await initDatabase();
  }
  return runExec(sql);
}

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl && databaseUrl.startsWith('postgres')) {
      try {
        console.log('🔄 Attempting connection to external PostgreSQL database specified in DATABASE_URL...');
        const pool = new Pool({
          connectionString: databaseUrl,
          ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
          connectionTimeoutMillis: 5000,
        });

        // Quick test probe with timeout
        await pool.query('SELECT 1 as connected;');
        pgPool = pool;
        isExternal = true;
        connectionError = null;
        console.log('✅ Connected to external PostgreSQL database via pg.Pool!');
      } catch (err: any) {
        console.warn('⚠️ Could not connect to external PostgreSQL server:', err.message);
        connectionError = err.message;
        console.log('🔄 Engaging persistent local PostgreSQL engine (PGlite PostgreSQL 18)...');
        pgPool = null;
      }
    }

    if (!pgPool) {
      const dataDir = path.resolve(process.cwd(), 'data', 'postgres_data');
      cleanupStaleLocks(dataDir);

      try {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        pgliteInstance = new PGlite(dataDir);
        await pgliteInstance.waitReady;
        const versionRes = await pgliteInstance.query('SELECT version();');
        console.log(`✅ PostgreSQL engine active: ${(versionRes.rows[0] as any).version}`);
        isExternal = false;
      } catch (err: any) {
        console.warn('⚠️ Storage directory init issue:', err.message, '- attempting lock cleanup and recovery...');
        cleanupStaleLocks(dataDir);
        try {
          if (pgliteInstance) {
            try { await pgliteInstance.close(); } catch {}
            pgliteInstance = null;
          }
          pgliteInstance = new PGlite(dataDir);
          await pgliteInstance.waitReady;
          console.log('✅ PostgreSQL storage re-opened successfully after lock cleanup.');
          isExternal = false;
        } catch (retryErr: any) {
          console.warn('⚠️ Re-opening failed, falling back to clean store:', retryErr.message);
          try {
            if (fs.existsSync(dataDir)) {
              fs.rmSync(dataDir, { recursive: true, force: true });
            }
            fs.mkdirSync(dataDir, { recursive: true });
            pgliteInstance = new PGlite(dataDir);
            await pgliteInstance.waitReady;
            console.log('✅ Fresh PostgreSQL storage initialized.');
          } catch (memErr: any) {
            console.warn('⚠️ Fallback to in-memory PostgreSQL engine:', memErr.message);
            pgliteInstance = new PGlite();
            await pgliteInstance.waitReady;
          }
        }
      }
    }

    // Execute database migrations & initial dataset if empty
    await runMigrationsAndDataset();

    isInitialized = true;
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

async function runMigrationsAndDataset(): Promise<void> {
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');

  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    await runExec(schemaContent);
    console.log('✅ PostgreSQL schema verified and applied.');
  }
}

export async function getDbStats() {
  await getDb();
  try {
    const [u, t, b, p, s, c] = await Promise.all([
      runQuery<{ count: string }>('SELECT COUNT(*) as count FROM users;'),
      runQuery<{ count: string }>('SELECT COUNT(*) as count FROM tasks;'),
      runQuery<{ count: string }>('SELECT COUNT(*) as count FROM bug_reports;'),
      runQuery<{ count: string }>('SELECT COUNT(*) as count FROM projects;'),
      runQuery<{ count: string }>('SELECT COUNT(*) as count FROM work_sessions;'),
      runQuery<{ count: string }>('SELECT COUNT(*) as count FROM corrective_time_entries;'),
    ]);
    return {
      connected: true,
      users: parseInt(u.rows[0]?.count || '0', 10),
      tasks: parseInt(t.rows[0]?.count || '0', 10),
      bugs: parseInt(b.rows[0]?.count || '0', 10),
      projects: parseInt(p.rows[0]?.count || '0', 10),
      workSessions: parseInt(s.rows[0]?.count || '0', 10),
      correctiveEntries: parseInt(c.rows[0]?.count || '0', 10),
      isExternal,
      connectionError,
    };
  } catch (err: any) {
    return {
      connected: false,
      users: 0,
      tasks: 0,
      bugs: 0,
      projects: 0,
      workSessions: 0,
      correctiveEntries: 0,
      isExternal,
      error: err.message,
    };
  }
}
