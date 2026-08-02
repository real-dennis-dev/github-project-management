const Redis = require("ioredis");
const NodeCache = require("node-cache");
const logger = require("./logger"); // adjust path if needed
const dotenv = require("dotenv");

dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.usingFallback = false;

    // In-memory fallback (NodeCache)
    this.fallback = new NodeCache({
      stdTTL: 3600, // default 1 hour
      checkperiod: 120, // check for expired keys every 2 min
      useClones: false,
    });
  }

  async connect() {
    // Already connected to Redis
    if (this.isConnected && this.client) {
      return this.client;
    }

    // Already decided to use fallback
    if (this.usingFallback) {
      return null;
    }

    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null, // required by BullMQ
        connectTimeout: 5000,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          // Stop retrying after a few attempts so we can fall back quickly
          if (times > 3) {
            return null; // stop retrying
          }
          return Math.min(times * 200, 2000);
        },
      });

      // Error handler – do NOT throw
      this.client.on("error", (err) => {
        logger.warn("Redis Client Error:", { message: err.message });
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        logger.info("Redis connected successfully");
        this.isConnected = true;
        this.usingFallback = false;
      });

      this.client.on("close", () => {
        logger.warn(
          "Redis connection closed – switching to NodeCache fallback"
        );
        this.isConnected = false;
        this.usingFallback = true;
      });

      // Wait until ready (or timeout)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Redis connection timeout"));
        }, 5000);

        this.client.once("ready", () => {
          clearTimeout(timeout);
          this.isConnected = true;
          resolve();
        });

        this.client.once("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      return this.client;
    } catch (error) {
      logger.warn("Failed to connect to Redis – falling back to NodeCache", {
        message: error.message,
      });
      this.isConnected = false;
      this.usingFallback = true;
      this.client = null;
      return null;
    }
  }

  // ---------- Public API (same shape as before) ----------

  async get(key) {
    await this.connect();

    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        logger.error("Redis GET failed, using fallback", {
          key,
          error: err.message,
        });
        this.usingFallback = true;
      }
    }

    // Fallback
    const value = this.fallback.get(key);
    return value === undefined ? null : value;
  }

  async set(key, value, ttl = 3600) {
    await this.connect();

    if (this.isConnected && this.client) {
      try {
        // ioredis set with EX
        await this.client.set(key, value, "EX", ttl);
        return "OK";
      } catch (err) {
        logger.error("Redis SET failed, using fallback", {
          key,
          error: err.message,
        });
        this.usingFallback = true;
      }
    }

    // Fallback
    this.fallback.set(key, value, ttl);
    return "OK";
  }

  async del(key) {
    await this.connect();

    if (this.isConnected && this.client) {
      try {
        // Support single key or array of keys
        if (Array.isArray(key)) {
          if (key.length === 0) return 0;
          return await this.client.del(...key);
        }
        return await this.client.del(key);
      } catch (err) {
        logger.error("Redis DEL failed, using fallback", {
          key,
          error: err.message,
        });
        this.usingFallback = true;
      }
    }

    // Fallback
    if (Array.isArray(key)) {
      let deleted = 0;
      key.forEach((k) => {
        if (this.fallback.del(k)) deleted++;
      });
      return deleted;
    }
    return this.fallback.del(key) ? 1 : 0;
  }

  async keys(pattern) {
    await this.connect();

    if (this.isConnected && this.client) {
      try {
        return await this.client.keys(pattern);
      } catch (err) {
        logger.error("Redis KEYS failed, using fallback", {
          pattern,
          error: err.message,
        });
        this.usingFallback = true;
      }
    }

    // Very simple pattern support for NodeCache (only * at the end)
    const allKeys = this.fallback.keys();
    if (pattern === "*") return allKeys;

    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    return allKeys.filter((k) => regex.test(k));
  }

  async flushAll() {
    await this.connect();

    if (this.isConnected && this.client) {
      try {
        await this.client.flushall();
        return "OK";
      } catch (err) {
        logger.error("Redis FLUSHALL failed, using fallback", {
          error: err.message,
        });
        this.usingFallback = true;
      }
    }

    this.fallback.flushAll();
    return "OK";
  }

  // Helper so other parts of the app can know which backend is active
  getStatus() {
    return {
      redisConnected: this.isConnected,
      usingFallback: this.usingFallback,
    };
  }
}

module.exports = new RedisClient();
