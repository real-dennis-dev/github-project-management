const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");
const RateLimiter = require("../../../common/middleware/security.middleware");

/**
 * AI Assistant Middleware
 * Provides middleware functions for AI assistant routes
 */
class AIAssistantMiddleware {
  /**
   * Validates project exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateProjectExists(req, res, next) {
    try {
      const { projectId } = req.params;

      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Project not found", 404);
      }

      req.project = data;
      next();
    } catch (error) {
      logger.error("Error in validateProjectExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates AI usage limits
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateAILimits(req, res, next) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id || "anonymous";

      // Get today's usage count
      const today = new Date().toISOString().split("T")[0];
      const { count, error } = await supabase
        .from("ai_conversations")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .gte("created_at", today);

      if (error) {
        logger.warn("Error checking AI limits:", error);
        // Continue even if check fails
        return next();
      }

      // Get from config
      const limits = {
        perDay: 500,
        perHour: 200,
        perUser: 50,
      };

      // Check daily limit
      if (count && count >= limits.perDay) {
        return ResponseUtils.sendError(
          res,
          `Daily AI usage limit reached (${limits.perDay} questions per day)`,
          429
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateAILimits:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes AI input
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeAIInput(req, res, next) {
    try {
      const data = req.body;

      if (data.question) {
        // Remove HTML tags and special characters
        data.question = data.question
          .replace(/<[^>]*>/g, "")
          .replace(/[^\w\s,.!?'"()-]/g, "")
          .trim();
      }

      if (data.text) {
        data.text = data.text
          .replace(/<[^>]*>/g, "")
          .replace(/[^\w\s,.!?'"()-]/g, "")
          .trim();
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeAIInput:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Logs AI activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logAIActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";
      const projectId = req.params.projectId || "unknown";

      logger.info("AI Activity", {
        action,
        path,
        userId,
        projectId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
      });
    });

    next();
  }

  /**
   * Validates AI provider availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateProviderAvailability(req, res, next) {
    try {
      const { config } = require("../config/ai.config");
      const provider = config.provider;

      if (provider === "mock") {
        // Allow mock provider
        return next();
      }

      // Check if required env vars are set
      let hasValidKeys = false;

      if (provider === "openai") {
        hasValidKeys =
          !!config.openai.apiKey && config.openai.apiKey.startsWith("sk-");
      } else if (provider === "anthropic") {
        hasValidKeys =
          !!config.anthropic.apiKey &&
          config.anthropic.apiKey.startsWith("sk-ant-");
      }

      if (!hasValidKeys && !process.env.NODE_ENV === "test") {
        return ResponseUtils.sendError(
          res,
          "AI provider not configured. Please set API keys.",
          503
        );
      }

      next();
    } catch (error) {
      logger.error("Error validating provider:", error);
      return ResponseUtils.sendError(res, "AI service unavailable", 503);
    }
  }

  /**
   * Validates response quality
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateResponseQuality(req, res, next) {
    // Store the original send function
    const originalSend = res.send;

    // Override send to validate response
    res.send = function (data) {
      try {
        // Only validate if it's a success response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseData = JSON.parse(data);
          if (responseData.data && responseData.data.response) {
            const AIUtils = require("../utils/ai-assistant.utils");
            const quality = AIUtils.validateResponseQuality(
              responseData.data.response.raw || responseData.data.response
            );

            if (!quality.isValid) {
              logger.warn("AI response quality check failed:", quality.issues);
              // Add quality info to response
              responseData.data.quality = quality;
              data = JSON.stringify(responseData);
            }
          }
        }
      } catch (error) {
        // Don't fail if validation fails
        logger.debug("Response quality validation error:", error.message);
      }

      originalSend.call(this, data);
    };

    next();
  }

  /**
   * Rate limiter for AI endpoints
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  rateLimitAI(req, res, next) {
    const config = require("../config/ai.config");
    const { rateLimit } = config.config;

    const key = `ai:rate:${req.user?.id || "anonymous"}`;
    const hourLimit = rateLimit.perHour;
    const dayLimit = rateLimit.perDay;

    // Get current counts
    const { getCache, setCache } = require("../../../common/utils/cache.utils");

    Promise.all([getCache(`${key}:hour`), getCache(`${key}:day`)])
      .then(([hourCount, dayCount]) => {
        const hourRequests = parseInt(hourCount || 0);
        const dayRequests = parseInt(dayCount || 0);

        if (dayRequests >= dayLimit) {
          return ResponseUtils.sendError(res, "Daily rate limit exceeded", 429);
        }

        if (hourRequests >= hourLimit) {
          return ResponseUtils.sendError(
            res,
            "Hourly rate limit exceeded",
            429
          );
        }

        // Increment counts
        const hourTTL = 3600; // 1 hour
        const dayTTL = 86400; // 24 hours

        setCache(`${key}:hour`, hourRequests + 1, hourTTL);
        setCache(`${key}:day`, dayRequests + 1, dayTTL);

        next();
      })
      .catch((error) => {
        logger.error("Error in AI rate limiting:", error);
        // Continue even if rate limiting fails
        next();
      });
  }
}

module.exports = new AIAssistantMiddleware();
