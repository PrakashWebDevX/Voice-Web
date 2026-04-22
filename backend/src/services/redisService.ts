import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis: max retries reached');
        return null;
      }
      return Math.min(times * 200, 3000);
    },
    lazyConnect: true,
    enableReadyCheck: true,
    connectTimeout: 10000,
    // TLS support for Upstash / Redis Cloud
    ...(url.startsWith('rediss://') ? { tls: {} } : {}),
  });

  redisClient.on('connect', () => logger.info('✅ Redis connected'));
  redisClient.on('error', (err) => logger.error('Redis error:', err.message));
  redisClient.on('reconnecting', () => logger.warn('⚠️ Redis reconnecting…'));

  return redisClient;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedisClient().get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    await getRedisClient().setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // non-fatal — degrade gracefully without cache
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedisClient().del(key);
  } catch {}
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await getRedisClient().keys(pattern);
    if (keys.length) await getRedisClient().del(...keys);
  } catch {}
}
