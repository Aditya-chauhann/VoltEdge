import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger'; // Adjust path based on my project's logger

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = env.REDIS_URL?.trim() || 'redis://localhost:6379';
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      family: 0,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 attempts. Using in-memory fallback.');
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis connection error', { error: err.message }));
  }
  return redisClient;
}
