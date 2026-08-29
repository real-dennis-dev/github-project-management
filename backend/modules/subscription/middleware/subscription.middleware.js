const { supabase } = require("../../../common/config/supabase");
const SubscriptionService = require("../services/subscription.service");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Subscription Middleware
 * Provides middleware functions for subscription routes
 */
class SubscriptionMiddleware {
  /**
   * Checks if user has an active subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async requireActiveSubscription(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      const subscription = await SubscriptionService.getCurrentSubscription(
        userId
      );

      if (!subscription || !subscription.is_active) {
        return ResponseUtils.sendForbidden(
          res,
          "Active subscription required for this action"
        );
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      logger.error("Error in requireActiveSubscription:", error);
      return ResponseUtils.sendError(
        res,
        "Error checking subscription status",
        500
      );
    }
  }

  /**
   * Checks feature access
   * @param {string} featureName - Feature name
   * @returns {Function} - Middleware function
   */
  requireFeatureAccess(featureName) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;

        if (!userId) {
          return ResponseUtils.sendUnauthorized(res, "User not authenticated");
        }

        const result = await SubscriptionService.checkFeatureUsage(
          userId,
          featureName
        );

        if (!result.allowed) {
          return ResponseUtils.sendForbidden(
            res,
            `Feature '${featureName}' is not available. ${result.message || ""}`
          );
        }

        // Store feature usage in request for later increment
        req.featureUsage = result;
        next();
      } catch (error) {
        logger.error(
          `Error in requireFeatureAccess for ${featureName}:`,
          error
        );
        return ResponseUtils.sendError(
          res,
          "Error checking feature access",
          500
        );
      }
    };
  }

  /**
   * Validates subscription ownership
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateSubscriptionOwnership(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid subscription ID", 400);
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Subscription not found", 404);
      }

      if (data.user_id !== userId) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to access this subscription"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateSubscriptionOwnership:", error);
      return ResponseUtils.sendError(res, "Error validating subscription", 500);
    }
  }

  /**
   * Validates plan ownership (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validatePlanOperation(req, res, next) {
    try {
      const user = req.user;

      // Check if user is admin
      if (!user || (user.role !== "admin" && user.role !== "project_manager")) {
        return ResponseUtils.sendForbidden(
          res,
          "Admin or project manager access required"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validatePlanOperation:", error);
      return ResponseUtils.sendError(res, "Error validating permissions", 500);
    }
  }

  /**
   * Increments feature usage after request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  trackFeatureUsage(req, res, next) {
    // Store original end function
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
      // Track feature usage if feature was used
      if (req.featureName && res.statusCode === 200) {
        const userId = req.user?.id;
        if (userId) {
          SubscriptionService.incrementFeatureUsage(
            userId,
            req.featureName
          ).catch((error) => {
            logger.error("Error tracking feature usage:", error);
          });
        }
      }

      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  /**
   * Validates webhook signature
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateWebhookSignature(req, res, next) {
    try {
      const signature = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!signature || !webhookSecret) {
        return ResponseUtils.sendError(
          res,
          "Webhook signature validation failed",
          401
        );
      }

      // In production, verify signature with Stripe library
      // For now, we'll just check if signature exists
      if (!signature || signature.length < 10) {
        return ResponseUtils.sendError(res, "Invalid webhook signature", 401);
      }

      next();
    } catch (error) {
      logger.error("Error in validateWebhookSignature:", error);
      return ResponseUtils.sendError(res, "Webhook validation failed", 401);
    }
  }

  /**
   * Validates subscription status transition
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateStatusTransition(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next();
      }

      // Get current subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Subscription not found", 404);
      }

      const from = data.status;
      const to = status;

      // Check if transition is valid
      const validTransitions = {
        inactive: ["active", "trialing", "past_due"],
        trialing: ["active", "expired", "canceled"],
        active: ["past_due", "canceled", "expired"],
        past_due: ["active", "canceled", "expired"],
        canceled: ["inactive", "active"],
        expired: ["inactive", "active"],
      };

      if (from === to) {
        return next();
      }

      if (!validTransitions[from]?.includes(to)) {
        return ResponseUtils.sendError(
          res,
          `Invalid status transition from ${from} to ${to}`,
          400
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateStatusTransition:", error);
      return ResponseUtils.sendError(
        res,
        "Error validating status transition",
        500
      );
    }
  }

  /**
   * Rate limiter for subscription endpoints
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async subscriptionRateLimiter(req, res, next) {
    try {
      const userId = req.user?.id || req.ip;
      const key = `rate_limit:subscription:${userId}`;

      // Get current count from cache (would use Redis in production)
      // For now, we'll use a simple in-memory store
      const store = req.app.get("rateLimitStore") || new Map();
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minute
      const maxRequests = 10; // 10 requests per minute

      const userData = store.get(key) || { count: 0, reset: now + windowMs };

      // Reset if window expired
      if (now > userData.reset) {
        userData.count = 0;
        userData.reset = now + windowMs;
      }

      userData.count++;

      if (userData.count > maxRequests) {
        const retryAfter = Math.ceil((userData.reset - now) / 1000);
        return ResponseUtils.sendError(
          res,
          `Too many requests. Please try again in ${retryAfter} seconds.`,
          429
        );
      }

      store.set(key, userData);
      req.app.set("rateLimitStore", store);

      next();
    } catch (error) {
      logger.error("Error in subscriptionRateLimiter:", error);
      next(); // Continue on error
    }
  }
}

const subscriptionMiddleware = new SubscriptionMiddleware();

module.exports = subscriptionMiddleware;
module.exports.subscriptionMiddleware = subscriptionMiddleware;
