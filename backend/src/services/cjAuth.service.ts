import { env } from '../config/env';
import { logger } from '../utils/logger';
import { redisService } from './redis.service';

export interface CJTokenData {
  accessToken: string;
  accessTokenExpiryDate: string;
  refreshToken: string;
  refreshTokenExpiryDate: string;
  openId?: number;
}

interface CJApiResponse<T> {
  code: number;
  result: boolean;
  message?: string;
  data: T;
}

const TOKEN_CACHE_KEY = 'cj:auth:token';
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

class CjAuthService {
  private baseUrl = env.CJ_API_BASE_URL;
  private apiKey = env.CJ_API_KEY;
  private tokenPromise: Promise<string> | null = null;

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private parseExpiry(expiryDate: string): number {
    const parsed = Date.parse(expiryDate);
    return Number.isNaN(parsed) ? Date.now() + 14 * 24 * 60 * 60 * 1000 : parsed;
  }

  private ttlSeconds(expiryDate: string): number {
    const expiresAt = this.parseExpiry(expiryDate);
    const ttlMs = expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS;
    return Math.max(Math.floor(ttlMs / 1000), 60);
  }

  private isTokenValid(token: CJTokenData): boolean {
    return this.parseExpiry(token.accessTokenExpiryDate) - Date.now() > TOKEN_REFRESH_BUFFER_MS;
  }

  private async postAuth<T>(endpoint: string, body: Record<string, string>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await response.json()) as CJApiResponse<T>;
    if (!response.ok || !json.result) {
      logger.error('CJ auth error', { endpoint, status: response.status, message: json.message });
      throw new Error(json.message ?? `CJ auth failed (${response.status})`);
    }

    return json.data;
  }

  private async fetchNewToken(): Promise<CJTokenData> {
    if (!this.apiKey) {
      throw new Error('CJ_API_KEY is not configured');
    }

    return this.postAuth<CJTokenData>('/authentication/getAccessToken', {
      apiKey: this.apiKey,
    });
  }

  private async refreshToken(refreshToken: string): Promise<CJTokenData> {
    return this.postAuth<CJTokenData>('/authentication/refreshAccessToken', {
      refreshToken,
    });
  }

  private async storeToken(token: CJTokenData): Promise<void> {
    const ttl = this.ttlSeconds(token.accessTokenExpiryDate);
    await redisService.set(TOKEN_CACHE_KEY, token, ttl);
  }

  private async resolveToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh) {
      const cached = await redisService.get<CJTokenData>(TOKEN_CACHE_KEY);
      if (cached && this.isTokenValid(cached)) {
        return cached.accessToken;
      }

      if (cached?.refreshToken) {
        try {
          const refreshed = await this.refreshToken(cached.refreshToken);
          const token: CJTokenData = {
            ...refreshed,
            openId: cached.openId,
          };
          await this.storeToken(token);
          return token.accessToken;
        } catch (err) {
          logger.warn('CJ token refresh failed, fetching new token', {
            error: (err as Error).message,
          });
        }
      }
    }

    const token = await this.fetchNewToken();
    await this.storeToken(token);
    return token.accessToken;
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('CJ_API_KEY is not configured');
    }

    if (!forceRefresh && this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.resolveToken(forceRefresh).finally(() => {
      this.tokenPromise = null;
    });

    return this.tokenPromise;
  }

  async invalidateToken(): Promise<void> {
    await redisService.del(TOKEN_CACHE_KEY);
  }
}

export const cjAuthService = new CjAuthService();
