import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class RedisService {
  private get client() {
    return getRedisClient();
  }

  private key(...parts: string[]): string {
    return parts.join(':');
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client.status !== 'ready') return null;
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (err) {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (this.client.status !== 'ready') return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      // Ignore
    }
  }

  async del(key: string): Promise<void> {
    if (this.client.status !== 'ready') return;
    try {
      await this.client.del(key);
    } catch (err) {
      // Ignore
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err) {
      logger.error('Redis DEL pattern error', { pattern, error: (err as Error).message });
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
    return env.REDIS_PRODUCT_TTL;
  }

  categoryTreeKey(): string {
    return this.key('categories', 'tree');
  }

  categoryHomeKey(firstCategoryId: string): string {
    return this.key('categories', 'home', firstCategoryId);
  }

  getCategoryTtl(): number {
    return env.REDIS_CATEGORY_TTL;
  }

  // Cart keys
  cartKey(userId?: string, sessionId?: string): string {
    if (userId) return this.key('cart', 'user', userId);
    if (sessionId) return this.key('cart', 'session', sessionId);
    throw new Error('Either userId or sessionId required for cart');
  }

  getCartTtl(): number {
    return env.REDIS_CART_TTL;
  }
}

export const redisService = new RedisService();
