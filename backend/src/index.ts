import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import responseTime from 'response-time';
import dotenv from 'dotenv';

import { connectDB } from './services/mongoService';
import { getRedisClient } from './services/redisService';
import { logger } from './services/logger';
import { rateLimiter } from './middleware/rateLimiter';
import generateRouter from './routes/generate';
import historyRouter from './routes/history';
import authRouter from './routes/auth';
import paymentsRouter from './routes/payments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.set('trust proxy', 1); // required when behind Nginx/Railway/Render proxy

// ─── Performance ─────────────────────────────────────────────────────────────
app.use(compression({ level: 6, threshold: 1024 }));
app.use(responseTime());

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Raw body for Razorpay webhook (MUST come before json middleware) ─────────
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Global rate limiter ─────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ─── Health / readiness ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    pid: process.pid,
    uptime: process.uptime().toFixed(2),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (_req, res) => {
  try {
    await getRedisClient().ping();
    res.json({ status: 'ready', redis: 'ok', pid: process.pid });
  } catch {
    res.status(503).json({ status: 'not ready', redis: 'down' });
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/generate', generateRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────
function gracefulShutdown(server: ReturnType<typeof app.listen>) {
  logger.info('Shutdown signal received');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
}

// ─── Start ───────────────────────────────────────────────────────────────────
(async () => {
  await connectDB();

  // Connect Redis (non-blocking — app degrades gracefully without it)
  try {
    await getRedisClient().connect();
  } catch (e) {
    logger.warn('Redis unavailable — running without cache/rate-limit-redis');
  }

  const server = app.listen(PORT, () => {
    logger.info(`🚀 VoiceForge API running on port ${PORT} [PID ${process.pid}]`);
  });

  process.on('SIGTERM', () => gracefulShutdown(server));
  process.on('SIGINT', () => gracefulShutdown(server));
})();

export default app;
