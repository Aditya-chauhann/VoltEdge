import Redis from 'ioredis';
import { env } from './env';

// Create a Redis client. By default, connects to localhost:6379
export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true, // Don't connect until we actually need it
  maxRetriesPerRequest: 1, // Don't retry infinitely on failure
  retryStrategy(times) {
    // Stop retrying after 3 attempts if Redis is not installed
    if (times > 3) {
      console.warn('⚠️  Redis connection failed after 3 attempts. Caching will be disabled.');
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000);
  },
});

let isRedisConnected = false;

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis cache.');
});

redisClient.on('error', (err) => {
  if (isRedisConnected) {
    console.error('❌ Redis error:', err.message);
  }
  isRedisConnected = false;
});

/**
 * Safely set a value in Redis with an expiration (in seconds)
 */
export async function setCache(key: string, value: any, ttlSeconds: number = 3600) {
  if (!isRedisConnected) return;
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    // Ignore error so it doesn't crash the request
  }
}

/**
 * Safely get a value from Redis
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    if (data) return JSON.parse(data) as T;
  } catch (err) {
    // Ignore error
  }
  return null;
}

// Immediately attempt connection
redisClient.connect().catch(() => {
  console.warn('⚠️  Redis server not found locally. Caching will be bypassed.');
});

export function getRedisClient() {
  return redisClient;
}
