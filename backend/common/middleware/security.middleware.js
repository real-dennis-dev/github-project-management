const dotenv = require("dotenv");
dotenv.config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
console.log(process.env.ALLOWED_ORIGINS);
class SecurityMiddleware {
  // Rate limiting by IP
  rateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: "Too many requests",
        message: "Please try again later",
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
      },
    });
  }

  // Specific rate limiter for authentication
  authRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, // 5 login attempts per 15 minutes
      message: {
        error: "Too many login attempts",
        message: "Please try again later",
      },
    });
  }

  // Sanitizes input data
  sanitizeInput(req, res, next) {
    const sanitize = (data) => {
      if (typeof data === "string") {
        // Remove HTML tags and trim
        return data
          .replace(/<[^>]*>/g, "")
          .replace(/javascript:/gi, "")
          .trim();
      }
      if (typeof data === "object" && data !== null) {
        if (Array.isArray(data)) {
          return data.map((item) => sanitize(item));
        }
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return data;
    };

    // Sanitize request body
    if (req.body) {
      req.body = sanitize(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitize(req.query);
    }

    next();
  }

  // Handles CORS

  corsHandler() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];

    return cors({
      origin: (origin, callback) => {
        if (allowedOrigins.includes("*") || !origin) {
          callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
      maxAge: 3600, // 1 hour
    });
  }

  // Sets security headers
  helmetSecurity() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: true,
      dnsPrefetchControl: true,
      frameguard: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: true,
      xssFilter: true,
    });
  }
}

module.exports = new SecurityMiddleware();
const stringUtils = new StringUtils();

module.exports = stringUtils;
module.exports.stringUtils = stringUtils;
