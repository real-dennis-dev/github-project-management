const { supabase } = require("../../../common/config/supabase");
const logger = require("../../../common/config/logger");

/**
 * Subscription Notification Service
 * Handles subscription-related notifications
 */
class SubscriptionNotificationService {
  /**
   * Sends subscription created notification
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {Promise<void>}
   */
  async notifySubscriptionCreated(subscription, plan) {
    try {
      const message = {
        title: "Subscription Created",
        body: `Your ${plan.name} subscription has been created successfully.`,
        data: {
          type: "subscription_created",
          subscriptionId: subscription.id,
          planName: plan.name,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying subscription created:", error);
    }
  }

  /**
   * Sends subscription updated notification
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {Object} changes - Changes made
   * @returns {Promise<void>}
   */
  async notifySubscriptionUpdated(subscription, plan, changes) {
    try {
      const changeDescriptions = Object.keys(changes)
        .map((key) => `${key}: ${changes[key]}`)
        .join(", ");

      const message = {
        title: "Subscription Updated",
        body: `Your ${plan.name} subscription has been updated. Changes: ${changeDescriptions}`,
        data: {
          type: "subscription_updated",
          subscriptionId: subscription.id,
          changes: changes,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying subscription updated:", error);
    }
  }

  /**
   * Sends subscription canceled notification
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {Promise<void>}
   */
  async notifySubscriptionCanceled(subscription, plan) {
    try {
      const message = {
        title: "Subscription Canceled",
        body: `Your ${
          plan.name
        } subscription has been canceled. You will have access until ${new Date(
          subscription.current_period_end
        ).toLocaleDateString()}.`,
        data: {
          type: "subscription_canceled",
          subscriptionId: subscription.id,
          planName: plan.name,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying subscription canceled:", error);
    }
  }

  /**
   * Sends payment succeeded notification
   * @param {Object} payment - Payment object
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {Promise<void>}
   */
  async notifyPaymentSucceeded(payment, subscription, plan) {
    try {
      const message = {
        title: "Payment Received",
        body: `Payment of ${payment.amount} ${payment.currency} for ${plan.name} subscription was successful.`,
        data: {
          type: "payment_succeeded",
          subscriptionId: subscription.id,
          paymentId: payment.id,
          amount: payment.amount,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying payment succeeded:", error);
    }
  }

  /**
   * Sends payment failed notification
   * @param {Object} payment - Payment object
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {Promise<void>}
   */
  async notifyPaymentFailed(payment, subscription, plan) {
    try {
      const message = {
        title: "Payment Failed",
        body: `Payment for ${plan.name} subscription failed. Please update your payment method to avoid service interruption.`,
        data: {
          type: "payment_failed",
          subscriptionId: subscription.id,
          paymentId: payment.id,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying payment failed:", error);
    }
  }

  /**
   * Sends trial ending notification
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {number} daysUntilEnd - Days until trial ends
   * @returns {Promise<void>}
   */
  async notifyTrialEnding(subscription, plan, daysUntilEnd) {
    try {
      const message = {
        title: "Trial Ending Soon",
        body: `Your ${plan.name} trial ends in ${daysUntilEnd} days. Subscribe now to continue using the service.`,
        data: {
          type: "trial_ending",
          subscriptionId: subscription.id,
          daysUntilEnd: daysUntilEnd,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying trial ending:", error);
    }
  }

  /**
   * Sends subscription expiring notification
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {number} daysUntilExpire - Days until expiration
   * @returns {Promise<void>}
   */
  async notifySubscriptionExpiring(subscription, plan, daysUntilExpire) {
    try {
      const message = {
        title: "Subscription Expiring Soon",
        body: `Your ${plan.name} subscription expires in ${daysUntilExpire} days. Renew now to continue service.`,
        data: {
          type: "subscription_expiring",
          subscriptionId: subscription.id,
          daysUntilExpire: daysUntilExpire,
        },
      };

      await this.sendNotification(subscription.user_id, message);
    } catch (error) {
      logger.error("Error notifying subscription expiring:", error);
    }
  }

  /**
   * Sends notification to user
   * @param {string} userId - User ID
   * @param {Object} message - Message object
   * @returns {Promise<void>}
   */
  async sendNotification(userId, message) {
    try {
      // Store notification in database
      await supabase.from("notifications").insert([
        {
          user_id: userId,
          title: message.title,
          body: message.body,
          data: message.data,
          read: false,
        },
      ]);

      // In production, would also send via email, push, etc.
      logger.info(`Notification sent to user ${userId}: ${message.title}`);
    } catch (error) {
      logger.error("Error sending notification:", error);
    }
  }
}

module.exports = new SubscriptionNotificationService();
