import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth.js';
import { tasksRouter } from './server/routes/tasks.js';
import { bugsRouter } from './server/routes/bugs.js';
import { reworkRouter } from './server/routes/rework.js';
import { payrollRouter } from './server/routes/payroll.js';
import { systemRouter } from './server/routes/system.js';
import { initDatabase, closeDatabase } from './server/pg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Authoritative PostgreSQL Database Initialization
  try {
    await initDatabase();
  } catch (err: any) {
    console.error('Database initialization warning:', err.message);
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Create uploads directory if not exists
  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/bugs', bugsRouter);
  app.use('/api/rework', reworkRouter);
  app.use('/api/payroll', payrollRouter);
  app.use('/api', systemRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'WorkTrack API', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WorkTrack Server running on http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, closing database cleanly...`);
    try {
      await closeDatabase();
    } catch {}
    process.exit(0);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
