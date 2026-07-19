const redisClient = require("../../config/redis");

class CacheUtils {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
  }

  // Gets cache by key
  async getCache(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  // Sets cache with TTL
  async setCache(key, value, ttl = this.defaultTTL) {
    try {
      const stringValue = JSON.stringify(value);
      await redisClient.set(key, stringValue, ttl);
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  // Deletes cache
  async deleteCache(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  // Clears cache by pattern
  async clearCache(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }

  // Invalidates related cache
  async invalidateRelated(keys) {
    try {
      for (const key of keys) {
        await this.deleteCache(key);
      }
      return true;
    } catch (error) {
      console.error("Cache invalidate error:", error);
      return false;
    }
  }

  // Checks if cache exists
  async exists(key) {
    try {
      const value = await redisClient.get(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  // Gets cache TTL
  async getTTL(key) {
    try {
      // Redis doesn't have a direct way to get TTL in this client
      // We'll implement a workaround by storing TTL in a separate key
      const ttlKey = `${key}:ttl`;
      const ttl = await redisClient.get(ttlKey);
      return ttl ? parseInt(ttl) : -1;
    } catch (error) {
      return -1;
    }
  }

  // Cache with function
  async cacheWithFunction(key, fn, ttl = this.defaultTTL) {
    try {
      const cached = await this.getCache(key);
      if (cached) {
        return cached;
      }

      const result = await fn();
      await this.setCache(key, result, ttl);
      return result;
    } catch (error) {
      console.error("Cache function error:", error);
      return await fn();
    }
  }
}

module.exports = new CacheUtils();
