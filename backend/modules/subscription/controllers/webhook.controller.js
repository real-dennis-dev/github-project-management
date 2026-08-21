const WebhookService = require("../services/webhook.service");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

/**
 * Webhook Controller
 * Handles webhook events
 */
class WebhookController {
  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(req, res) {
    try {
      const signature = req.headers["stripe-signature"];
      const payload = req.body;

      // Verify webhook signature
      // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      const result = await WebhookService.processStripeWebhook(payload);

      if (result.error) {
        return ResponseUtils.sendError(res, result.error, 400);
      }

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Webhook processed successfully"
      );
    } catch (error) {
      logger.error("Error in handleStripeWebhook:", error);
      return ResponseUtils.sendError(res, "Webhook processing failed", 500);
    }
  }

  /**
   * Handle generic webhook
   */
  async handleWebhook(req, res) {
    try {
      const { eventType } = req.params;
      const payload = req.body;

      const result = await WebhookService.processWebhook(eventType, payload);

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Webhook processed successfully"
      );
    } catch (error) {
      logger.error("Error in handleWebhook:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents(req, res) {
    try {
      const { processed, limit = 50 } = req.query;

      const events = await WebhookService.getWebhookEvents(processed, limit);

      return ResponseUtils.sendSuccess(
        res,
        events,
        "Webhook events retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getWebhookEvents:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(req, res) {
    try {
      const { id } = req.params;

      const result = await WebhookService.retryWebhook(id);

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Webhook retried successfully"
      );
    } catch (error) {
      logger.error("Error in retryWebhook:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new WebhookController();
