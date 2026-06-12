import redis from '../config/redis';
import { logger } from '../utils/logger';

export class CacheService {
  private prefix = 'homelabos:';

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    try {
      await redis.setex(this.prefix + key, ttlSeconds, JSON.stringify(value));
    } catch (error: any) {
      logger.error('Cache set error:', error.message);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(this.prefix + key);
    } catch (error: any) {
      logger.error('Cache delete error:', error.message);
    }
  }

  async flush(pattern = '*'): Promise<void> {
    try {
      const keys = await redis.keys(this.prefix + pattern);
      if (keys.length) await redis.del(...keys);
    } catch (error: any) {
      logger.error('Cache flush error:', error.message);
    }
  }
}

export const cacheService = new CacheService();
