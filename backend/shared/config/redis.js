const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return this.client;

    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
        password: process.env.REDIS_PASSWORD,
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis connected successfully");
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      // Return a mock client if Redis is not available
      return this.getMockClient();
    }
  }

  getMockClient() {
    return {
      get: async (key) => null,
      set: async (key, value, options) => "OK",
      del: async (key) => 1,
      keys: async (pattern) => [],
      flushAll: async () => "OK",
    };
  }

  async get(key) {
    const client = await this.connect();
    return client.get(key);
  }

  async set(key, value, ttl = 3600) {
    const client = await this.connect();
    return client.set(key, value, { EX: ttl });
  }

  async del(key) {
    const client = await this.connect();
    return client.del(key);
  }

  async keys(pattern) {
    const client = await this.connect();
    return client.keys(pattern);
  }

  async flushAll() {
    const client = await this.connect();
    return client.flushAll();
  }
}

module.exports = new RedisClient();
