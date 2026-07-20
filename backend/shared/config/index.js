import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    env: process.env.NODE_ENV || "development",
    apiUrl: process.env.API_URL || "http://localhost:3000",
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL || "3600", 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    authWindowMs: parseInt(
      process.env.RATE_LIMIT_AUTH_WINDOW_MS || "600000",
      10
    ),
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || "5", 10),
  },

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json",
    filePath: process.env.LOG_FILE_PATH || "./logs",
  },

  upload: {
    dir: process.env.UPLOAD_DIR || "./uploads",
    maxSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ],
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || "3600", 10),
    enabled: process.env.CACHE_ENABLED === "true",
  },

  features: {
    enableGithubIntegration: process.env.ENABLE_GITHUB_INTEGRATION === "true",
    enableAIAssistant: process.env.ENABLE_AI_ASSISTANT === "true",
    enableExport: process.env.ENABLE_EXPORT === "true",
  },
};

// Validate required configuration
export const validateConfig = () => {
  const required = [
    "supabase.url",
    "supabase.anonKey",
    "supabase.serviceRoleKey",
    "jwt.secret",
  ];

  const missing = required.filter((key) => {
    const parts = key.split(".");
    let value = config;
    for (const part of parts) {
      value = value?.[part];
    }
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }

  return true;
};

export default config;
