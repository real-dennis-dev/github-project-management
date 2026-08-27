const redisClient = require("../config/redis"); // adjust path if needed
const logger = require("../config/logger"); // adjust path if needed

class CacheUtils {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
  }

  async getCache(key) {
    try {
      const value = await redisClient.get(key);
      if (value === null || value === undefined) return null;

      // Value coming from Redis is always a string; from NodeCache it may already be an object
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value; // plain string
        }
      }
      return value;
    } catch (error) {
      logger.error("Cache get error", { key, error: error.message });
      return null;
    }
  }

  async setCache(key, value, ttl = this.defaultTTL) {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      await redisClient.set(key, stringValue, ttl);
      return true;
    } catch (error) {
      logger.error("Cache set error", { key, error: error.message });
      return false;
    }
  }

  async deleteCache(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error("Cache delete error", { key, error: error.message });
      return false;
    }
  }

  async clearCache(pattern = "*") {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      logger.error("Cache clear error", { pattern, error: error.message });
      return false;
    }
  }

  async invalidateRelated(keys = []) {
    try {
      if (!Array.isArray(keys) || keys.length === 0) return true;
      await redisClient.del(keys);
      return true;
    } catch (error) {
      logger.error("Cache invalidate error", { error: error.message });
      return false;
    }
  }

  async exists(key) {
    try {
      const value = await redisClient.get(key);
      return value !== null && value !== undefined;
    } catch (error) {
      return false;
    }
  }

  async getTTL(key) {
    // NodeCache / Redis TTL helpers are different.
    // For simplicity we return -1 when using pure fallback
    // or when we don't store separate TTL keys.
    try {
      const status = redisClient.getStatus();
      if (status.usingFallback || !status.redisConnected) {
        // node-cache has getTtl
        const ttl = redisClient.fallback.getTtl(key);
        if (!ttl) return -1;
        return Math.max(0, Math.round((ttl - Date.now()) / 1000));
      }

      // Redis: use the built-in TTL command
      const ttl = await redisClient.client.ttl(key);
      return ttl;
    } catch (error) {
      return -1;
    }
  }

  /**
   * Cache-aside helper
   */
  async cacheWithFunction(key, fn, ttl = this.defaultTTL) {
    try {
      const cached = await this.getCache(key);
      if (cached !== null) {
        return cached;
      }

      const result = await fn();
      await this.setCache(key, result, ttl);
      return result;
    } catch (error) {
      logger.error("Cache function error", { key, error: error.message });
      // Always try to return the real result even if caching fails
      return await fn();
    }
  }
}

module.exports = new CacheUtils();
const stringUtils = new StringUtils();

module.exports = stringUtils;
module.exports.stringUtils = stringUtils;
