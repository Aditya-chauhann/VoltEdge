import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// In-memory fallback if Redis is down
const memoryCache = new Map<string, { value: string, expiry: number | null }>();

export class RedisService {
  private get client() {
    return getRedisClient();
  }

  private key(...parts: string[]): string {
    return parts.join(':');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.client.status === 'ready') {
        const data = await this.client.get(key);
        return data ? (JSON.parse(data) as T) : null;
      }
    } catch (err) {
      logger.error('Redis GET error', { key, error: (err as Error).message });
    }
    
    // Fallback
    const mem = memoryCache.get(key);
    if (mem) {
      if (mem.expiry && Date.now() > mem.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return JSON.parse(mem.value) as T;
    }
    return null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (this.client.status === 'ready') {
        if (ttlSeconds) {
          await this.client.setex(key, ttlSeconds, serialized);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      }
    } catch (err) {
      logger.error('Redis SET error', { key, error: (err as Error).message });
    }
    
    // Fallback
    memoryCache.set(key, { 
      value: serialized, 
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null 
    });
  }

  async del(key: string): Promise<void> {
    try {
      if (this.client.status === 'ready') {
        await this.client.del(key);
        return;
      }
    } catch (err) {
      logger.error('Redis DEL error', { key, error: (err as Error).message });
    }
    
    // Fallback
    memoryCache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      if (this.client.status === 'ready') {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
        return;
      }
    } catch (err) {
      logger.error('Redis DEL pattern error', { pattern, error: (err as Error).message });
    }

    // Fallback - simple pattern matching on memoryCache
    const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of memoryCache.keys()) {
      if (regexPattern.test(key)) {
        memoryCache.delete(key);
      }
    }
  }

  // Product cache keys
  productListKey(page: number, limit: number, filters: string): string {
    return this.key('products', 'list', String(page), String(limit), filters);
  }

  productDetailKey(pid: string): string {
    return this.key('products', 'detail', pid);
  }

  productSearchKey(query: string, page: number): string {
    return this.key('products', 'search', query, String(page));
  }

  getProductTtl(): number {
    return env.REDIS_PRODUCT_TTL || 3600;
  }

  categoryTreeKey(): string {
    return this.key('categories', 'tree');
  }

  categoryHomeKey(firstCategoryId: string): string {
    return this.key('categories', 'home', firstCategoryId);
  }

  getCategoryTtl(): number {
    return env.REDIS_CATEGORY_TTL || 86400;
  }

  // Cart keys
  cartKey(userId?: string, sessionId?: string): string {
    if (userId) return this.key('cart', 'user', userId);
    if (sessionId) return this.key('cart', 'session', sessionId);
    throw new Error('Either userId or sessionId required for cart');
  }

  getCartTtl(): number {
    return env.REDIS_CART_TTL || 604800;
  }
}

export const redisService = new RedisService();
