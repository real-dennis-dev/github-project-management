const { supabase } = require("../../../common/config/supabase");
const SubscriptionService = require("./subscription.service");
const PaymentService = require("./payment.service");
const logger = require("../../../common/config/logger");

/**
 * Webhook Service
 * Handles webhook event processing
 */
class WebhookService {
  /**
   * Processes Stripe webhook events
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>} - Processing result
   */
  async processStripeWebhook(payload) {
    try {
      const eventType = payload.type;
      const eventData = payload.data.object;

      // Store webhook event
      const { data: webhookEvent, error: storeError } = await supabase
        .from("webhook_events")
        .insert([
          {
            event_type: eventType,
            payload: payload,
            stripe_event_id: payload.id,
            processed: false,
          },
        ])
        .select()
        .single();

      if (storeError) {
        logger.error("Error storing webhook event:", storeError);
        throw new Error("Failed to store webhook event");
      }

      // Process based on event type
      let result = { event: eventType, processed: false };

      switch (eventType) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
          result = await this.handleSubscriptionUpdate(eventData);
          break;

        case "customer.subscription.deleted":
          result = await this.handleSubscriptionDeleted(eventData);
          break;

        case "invoice.payment_succeeded":
          result = await this.handlePaymentSucceeded(eventData);
          break;

        case "invoice.payment_failed":
          result = await this.handlePaymentFailed(eventData);
          break;

        case "customer.subscription.trial_will_end":
          result = await this.handleTrialWillEnd(eventData);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${eventType}`);
          result = {
            event: eventType,
            processed: true,
            message: "Unhandled event type",
          };
      }

      // Mark as processed
      await supabase
        .from("webhook_events")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookEvent.id);

      return result;
    } catch (error) {
      logger.error("WebhookService.processStripeWebhook error:", error);
      throw error;
    }
  }

  /**
   * Handles subscription update events
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Processing result
   */
  async handleSubscriptionUpdate(data) {
    try {
      const stripeSubscriptionId = data.id;
      const status = data.status;
      const customerId = data.customer;

      // Find subscription in database
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .single();

      if (error || !subscription) {
        logger.warn(
          `Subscription not found for Stripe ID: ${stripeSubscriptionId}`
        );
        return {
          event: "subscription.update",
          processed: false,
          error: "Subscription not found",
        };
      }

      // Map Stripe status to our status
      const statusMap = {
        active: "active",
        past_due: "past_due",
        canceled: "canceled",
        incomplete: "inactive",
        incomplete_expired: "expired",
        trialing: "trialing",
        unpaid: "past_due",
      };

      const newStatus = statusMap[status] || "inactive";

      // Update subscription
      const { data: updated, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: newStatus,
          current_period_end: data.current_period_end
            ? new Date(data.current_period_end * 1000).toISOString()
            : null,
          current_period_start: data.current_period_start
            ? new Date(data.current_period_start * 1000).toISOString()
            : null,
          cancel_at_period_end: data.cancel_at_period_end || false,
          metadata: {
            ...subscription.metadata,
            stripe_updated_at: new Date().toISOString(),
          },
        })
        .eq("id", subscription.id)
        .select()
        .single();

      if (updateError) {
        logger.error("Error updating subscription from webhook:", updateError);
        throw new Error("Failed to update subscription");
      }

      logger.info(
        `Subscription ${subscription.id} updated via webhook to status: ${newStatus}`
      );
      return {
        event: "subscription.update",
        processed: true,
        subscriptionId: subscription.id,
        status: newStatus,
      };
    } catch (error) {
      logger.error("WebhookService.handleSubscriptionUpdate error:", error);
      throw error;
    }
  }

  /**
   * Handles subscription deleted events
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Processing result
   */
  async handleSubscriptionDeleted(data) {
    try {
      const stripeSubscriptionId = data.id;

      // Find subscription in database
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .single();

      if (error || !subscription) {
        logger.warn(
          `Subscription not found for Stripe ID: ${stripeSubscriptionId}`
        );
        return {
          event: "subscription.deleted",
          processed: false,
          error: "Subscription not found",
        };
      }

      // Mark as canceled
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      if (updateError) {
        logger.error("Error updating canceled subscription:", updateError);
        throw new Error("Failed to update subscription");
      }

      logger.info(`Subscription ${subscription.id} canceled via webhook`);
      return {
        event: "subscription.deleted",
        processed: true,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      logger.error("WebhookService.handleSubscriptionDeleted error:", error);
      throw error;
    }
  }

  /**
   * Handles payment succeeded events
   * @param {Object} data - Invoice data
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentSucceeded(data) {
    try {
      const stripeInvoiceId = data.id;
      const stripeSubscriptionId = data.subscription;
      const amount = data.amount_paid / 100;
      const currency = data.currency;

      // Find subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .single();

      if (error || !subscription) {
        logger.warn(
          `Subscription not found for Stripe ID: ${stripeSubscriptionId}`
        );
        return {
          event: "payment.succeeded",
          processed: false,
          error: "Subscription not found",
        };
      }

      // Check if payment already exists
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_invoice_id", stripeInvoiceId)
        .single();

      if (existingPayment) {
        logger.info(
          `Payment already processed for invoice: ${stripeInvoiceId}`
        );
        return {
          event: "payment.succeeded",
          processed: true,
          alreadyProcessed: true,
        };
      }

      // Create payment record
      const paymentData = {
        subscription_id: subscription.id,
        amount: amount,
        currency: currency,
        status: "succeeded",
        stripe_invoice_id: stripeInvoiceId,
        stripe_payment_intent_id: data.payment_intent,
        payment_method_type: "stripe",
        description: `Payment for subscription ${subscription.id}`,
        receipt_url: data.hosted_invoice_url,
        invoice_url: data.hosted_invoice_url,
        paid_at: new Date().toISOString(),
      };

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) {
        logger.error("Error creating payment record:", paymentError);
        throw new Error("Failed to create payment record");
      }

      // Update subscription period
      if (data.lines && data.lines.data && data.lines.data.length > 0) {
        const lineItem = data.lines.data[0];
        const periodStart = lineItem.period?.start;
        const periodEnd = lineItem.period?.end;

        if (periodStart && periodEnd) {
          await supabase
            .from("subscriptions")
            .update({
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              status: "active",
            })
            .eq("id", subscription.id);
        }
      }

      logger.info(
        `Payment processed for subscription ${subscription.id}: ${amount} ${currency}`
      );
      return {
        event: "payment.succeeded",
        processed: true,
        subscriptionId: subscription.id,
        paymentId: payment.id,
        amount: amount,
      };
    } catch (error) {
      logger.error("WebhookService.handlePaymentSucceeded error:", error);
      throw error;
    }
  }

  /**
   * Handles payment failed events
   * @param {Object} data - Invoice data
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentFailed(data) {
    try {
      const stripeInvoiceId = data.id;
      const stripeSubscriptionId = data.subscription;

      // Find subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .single();

      if (error || !subscription) {
        logger.warn(
          `Subscription not found for Stripe ID: ${stripeSubscriptionId}`
        );
        return {
          event: "payment.failed",
          processed: false,
          error: "Subscription not found",
        };
      }

      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          metadata: {
            ...subscription.metadata,
            last_payment_failed: new Date().toISOString(),
            payment_failure_reason: data.attempt_count || "unknown",
          },
        })
        .eq("id", subscription.id);

      // Create failed payment record
      const paymentData = {
        subscription_id: subscription.id,
        amount: data.amount_due / 100 || 0,
        currency: data.currency || "USD",
        status: "failed",
        stripe_invoice_id: stripeInvoiceId,
        stripe_payment_intent_id: data.payment_intent,
        payment_method_type: "stripe",
        description: `Failed payment for subscription ${subscription.id}`,
        metadata: {
          failure_reason: data.attempt_count || "unknown",
          failure_code: data.attempt_count || "unknown",
        },
      };

      await supabase.from("payments").insert([paymentData]);

      logger.warn(`Payment failed for subscription ${subscription.id}`);
      return {
        event: "payment.failed",
        processed: true,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      logger.error("WebhookService.handlePaymentFailed error:", error);
      throw error;
    }
  }

  /**
   * Handles trial will end events
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Processing result
   */
  async handleTrialWillEnd(data) {
    try {
      const stripeSubscriptionId = data.id;

      // Find subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .single();

      if (error || !subscription) {
        logger.warn(
          `Subscription not found for Stripe ID: ${stripeSubscriptionId}`
        );
        return {
          event: "trial.will_end",
          processed: false,
          error: "Subscription not found",
        };
      }

      // Send notification (would integrate with notification service)
      logger.info(
        `Trial will end for subscription ${subscription.id} on ${data.trial_end}`
      );

      // Update metadata
      await supabase
        .from("subscriptions")
        .update({
          metadata: {
            ...subscription.metadata,
            trial_end_notification_sent: new Date().toISOString(),
          },
        })
        .eq("id", subscription.id);

      return {
        event: "trial.will_end",
        processed: true,
        subscriptionId: subscription.id,
        trialEnd: data.trial_end,
      };
    } catch (error) {
      logger.error("WebhookService.handleTrialWillEnd error:", error);
      throw error;
    }
  }

  /**
   * Processes generic webhook
   * @param {string} eventType - Event type
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>} - Processing result
   */
  async processWebhook(eventType, payload) {
    try {
      // Store webhook event
      const { data: webhookEvent, error: storeError } = await supabase
        .from("webhook_events")
        .insert([
          {
            event_type: eventType,
            payload: payload,
            processed: false,
          },
        ])
        .select()
        .single();

      if (storeError) {
        logger.error("Error storing webhook event:", storeError);
        throw new Error("Failed to store webhook event");
      }

      // Process based on event type
      let result = { event: eventType, processed: false };

      switch (eventType) {
        case "subscription.created":
        case "subscription.updated":
          result = await this.handleGenericSubscriptionUpdate(payload);
          break;

        case "subscription.canceled":
          result = await this.handleGenericSubscriptionCanceled(payload);
          break;

        case "payment.succeeded":
          result = await this.handleGenericPaymentSucceeded(payload);
          break;

        default:
          logger.info(`Unhandled generic webhook event type: ${eventType}`);
          result = {
            event: eventType,
            processed: true,
            message: "Unhandled event type",
          };
      }

      // Mark as processed
      await supabase
        .from("webhook_events")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookEvent.id);

      return result;
    } catch (error) {
      logger.error("WebhookService.processWebhook error:", error);
      throw error;
    }
  }

  /**
   * Gets webhook events
   * @param {boolean} processed - Filter by processed status
   * @param {number} limit - Limit results
   * @returns {Promise<Array>} - Webhook events
   */
  async getWebhookEvents(processed, limit = 50) {
    try {
      let query = supabase
        .from("webhook_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (processed !== undefined && processed !== null) {
        query = query.eq(
          "processed",
          processed === "true" || processed === true
        );
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching webhook events:", error);
        throw new Error("Failed to fetch webhook events");
      }

      return data || [];
    } catch (error) {
      logger.error("WebhookService.getWebhookEvents error:", error);
      throw error;
    }
  }

  /**
   * Retries a failed webhook
   * @param {string} id - Webhook event ID
   * @returns {Promise<Object>} - Retry result
   */
  async retryWebhook(id) {
    try {
      // Get webhook event
      const { data: event, error } = await supabase
        .from("webhook_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !event) {
        throw new Error("Webhook event not found");
      }

      // Reprocess webhook
      const result = await this.processWebhook(event.event_type, event.payload);

      return {
        eventId: id,
        success: true,
        result,
      };
    } catch (error) {
      logger.error("WebhookService.retryWebhook error:", error);
      throw error;
    }
  }

  /**
   * Handles generic subscription update
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Processing result
   */
  async handleGenericSubscriptionUpdate(data) {
    try {
      const { subscriptionId, planId, status } = data;

      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .single();

      if (error || !subscription) {
        logger.warn(`Subscription not found: ${subscriptionId}`);
        return {
          event: "subscription.update",
          processed: false,
          error: "Subscription not found",
        };
      }

      const updateData = {};
      if (planId) updateData.plan_id = planId;
      if (status) updateData.status = status;

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("id", subscriptionId);
      }

      return {
        event: "subscription.update",
        processed: true,
        subscriptionId,
      };
    } catch (error) {
      logger.error(
        "WebhookService.handleGenericSubscriptionUpdate error:",
        error
      );
      throw error;
    }
  }

  /**
   * Handles generic subscription canceled
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Processing result
   */
  async handleGenericSubscriptionCanceled(data) {
    try {
      const { subscriptionId } = data;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      return {
        event: "subscription.canceled",
        processed: true,
        subscriptionId,
      };
    } catch (error) {
      logger.error(
        "WebhookService.handleGenericSubscriptionCanceled error:",
        error
      );
      throw error;
    }
  }

  /**
   * Handles generic payment succeeded
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Processing result
   */
  async handleGenericPaymentSucceeded(data) {
    try {
      const { subscriptionId, amount, currency, paymentId } = data;

      const paymentData = {
        subscription_id: subscriptionId,
        amount: amount,
        currency: currency || "USD",
        status: "succeeded",
        paid_at: new Date().toISOString(),
      };

      if (paymentId) {
        paymentData.id = paymentId;
      }

      await supabase.from("payments").insert([paymentData]);

      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", subscriptionId);

      return {
        event: "payment.succeeded",
        processed: true,
        subscriptionId,
      };
    } catch (error) {
      logger.error(
        "WebhookService.handleGenericPaymentSucceeded error:",
        error
      );
      throw error;
    }
  }
}

const webhookService = new WebhookService();

module.exports = webhookService;
module.exports.webhookService = webhookService;
