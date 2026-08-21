const SubscriptionService = require("../services/subscription.service");
const SubscriptionUtils = require("../utils/subscription.utils");
const {
  subscriptionSchemas,
} = require("../validations/subscription.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Subscription Controller
 * Handles HTTP requests for subscriptions
 */
class SubscriptionController {
  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(req, res) {
    try {
      const userId = req.user.id;
      const queryParams = req.query;

      const { error, value } =
        subscriptionSchemas.getSubscriptions.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await SubscriptionService.getUserSubscriptions(
        userId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Subscriptions retrieved successfully",
        200,
        {
          pagination: result.pagination,
          summary: result.summary,
        }
      );
    } catch (error) {
      logger.error("Error in getUserSubscriptions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      const { error, value } =
        subscriptionSchemas.createSubscription.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const subscription = await SubscriptionService.createSubscription(
        userId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        subscription,
        "Subscription created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createSubscription:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid subscription ID", 400);
      }

      const subscription = await SubscriptionService.getSubscriptionById(
        id,
        userId
      );

      return ResponseUtils.sendSuccess(
        res,
        subscription,
        "Subscription retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getSubscriptionById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid subscription ID", 400);
      }

      const { error, value } =
        subscriptionSchemas.updateSubscription.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const subscription = await SubscriptionService.updateSubscription(
        id,
        userId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        subscription,
        "Subscription updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateSubscription:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid subscription ID", 400);
      }

      const { error, value } =
        subscriptionSchemas.cancelSubscription.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const subscription = await SubscriptionService.cancelSubscription(
        id,
        userId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        subscription,
        "Subscription cancelled successfully"
      );
    } catch (error) {
      logger.error("Error in cancelSubscription:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get current subscription
   */
  async getCurrentSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await SubscriptionService.getCurrentSubscription(
        userId
      );

      if (!subscription) {
        return ResponseUtils.sendSuccess(
          res,
          null,
          "No active subscription found"
        );
      }

      return ResponseUtils.sendSuccess(
        res,
        subscription,
        "Current subscription retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCurrentSubscription:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Check feature access
   */
  async checkFeatureAccess(req, res) {
    try {
      const userId = req.user.id;
      const { featureName } = req.params;

      const result = await SubscriptionService.checkFeatureUsage(
        userId,
        featureName
      );

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Feature access checked successfully"
      );
    } catch (error) {
      logger.error("Error in checkFeatureAccess:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get feature usage
   */
  async getFeatureUsage(req, res) {
    try {
      const userId = req.user.id;

      const usage = await SubscriptionService.getFeatureUsage(userId);

      return ResponseUtils.sendSuccess(
        res,
        usage,
        "Feature usage retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getFeatureUsage:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new SubscriptionController();
