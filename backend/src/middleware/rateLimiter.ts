import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../services/redisService';
import { logger } from '../services/logger';

function makeStore() {
  try {
    return new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        (getRedisClient() as any).call(command, ...args),
      prefix: 'vf_rl:',
    });
  } catch {
    logger.warn('Redis rate-limit store unavailable — using memory store');
    return undefined;
  }
}

export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: 'Too many requests. Please slow down.' },
  skip: (req) => req.path === '/health' || req.path === '/ready',
  keyGenerator: (req) =>
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown',
});

export const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.GENERATE_RATE_LIMIT_MAX) || 15,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  message: { error: 'Too many generation requests. Please wait a moment.' },
  keyGenerator: (req) =>
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown',
});