const { supabase } = require("../../../common/config/supabase");
const PaymentUtils = require("../utils/payment.utils");
const logger = require("../../../common/config/logger");

/**
 * Payment Service
 * Handles business logic for payments
 */
class PaymentService {
  /**
   * Gets payments for a subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Payments with pagination
   */
  async getSubscriptionPayments(subscriptionId, options = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      let query = supabase
        .from("payments")
        .select("*", { count: "exact" })
        .eq("subscription_id", subscriptionId);

      if (status) {
        const validStatuses = [
          "pending",
          "succeeded",
          "failed",
          "refunded",
          "charged_back",
        ];
        if (validStatuses.includes(status)) {
          query = query.eq("status", status);
        }
      }

      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching payments:", error);
        throw new Error("Failed to fetch payments");
      }

      const formattedPayments = (data || []).map((payment) =>
        PaymentUtils.formatPayment(payment)
      );

      return {
        data: formattedPayments,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("PaymentService.getSubscriptionPayments error:", error);
      throw error;
    }
  }

  /**
   * Creates a new payment
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Created payment
   */
  async createPayment(data) {
    try {
      // Validate data
      const validation = PaymentUtils.validatePaymentData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Check if subscription exists
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", data.subscription_id)
        .single();

      if (subError || !subscription) {
        throw new Error("Subscription not found");
      }

      // Prepare payment data
      const paymentData = {
        subscription_id: data.subscription_id,
        amount: data.amount,
        currency: data.currency || "USD",
        status: "pending",
        payment_method_type: data.payment_method_type || "stripe",
        description: data.description || null,
        metadata: data.metadata || {},
      };

      const { data: payment, error } = await supabase
        .from("payments")
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating payment:", error);
        throw new Error("Failed to create payment");
      }

      logger.info(
        `Payment created: ${payment.id} for subscription ${data.subscription_id}`
      );
      return PaymentUtils.formatPayment(payment);
    } catch (error) {
      logger.error("PaymentService.createPayment error:", error);
      throw error;
    }
  }

  /**
   * Gets a payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} - Payment object
   */
  async getPaymentById(id) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          subscriptions (
            *,
            plans (*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching payment:", error);
        throw new Error("Payment not found");
      }

      return PaymentUtils.formatPayment(data);
    } catch (error) {
      logger.error("PaymentService.getPaymentById error:", error);
      throw error;
    }
  }

  /**
   * Updates payment status
   * @param {string} id - Payment ID
   * @param {string} status - New status
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} - Updated payment
   */
  async updatePaymentStatus(id, status, data = {}) {
    try {
      const validStatuses = [
        "pending",
        "succeeded",
        "failed",
        "refunded",
        "charged_back",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid payment status");
      }

      // Check if payment exists
      await this.getPaymentById(id);

      const updateData = {
        status,
        ...data,
      };

      if (status === "succeeded") {
        updateData.paid_at = new Date().toISOString();
      }

      const { data: payment, error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating payment status:", error);
        throw new Error("Failed to update payment status");
      }

      logger.info(`Payment status updated: ${id} -> ${status}`);
      return PaymentUtils.formatPayment(payment);
    } catch (error) {
      logger.error("PaymentService.updatePaymentStatus error:", error);
      throw error;
    }
  }

  /**
   * Processes a successful payment
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Processed payment
   */
  async processSuccessfulPayment(paymentId, data = {}) {
    try {
      const payment = await this.getPaymentById(paymentId);

      // Update payment status
      const updatedPayment = await this.updatePaymentStatus(
        paymentId,
        "succeeded",
        {
          stripe_payment_intent_id: data.payment_intent_id,
          stripe_invoice_id: data.invoice_id,
          receipt_url: data.receipt_url,
          invoice_url: data.invoice_url,
        }
      );

      // Get subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", payment.subscription_id)
        .single();

      if (subscription) {
        // Update subscription status if needed
        if (subscription.status === "past_due") {
          await supabase
            .from("subscriptions")
            .update({ status: "active" })
            .eq("id", subscription.id);
        }

        // Update period end
        const newPeriodEnd = SubscriptionUtils.calculatePeriodEnd(
          new Date(),
          subscription.interval
        );

        await supabase
          .from("subscriptions")
          .update({
            current_period_start: new Date().toISOString(),
            current_period_end: newPeriodEnd.toISOString(),
          })
          .eq("id", subscription.id);
      }

      return updatedPayment;
    } catch (error) {
      logger.error("PaymentService.processSuccessfulPayment error:", error);
      throw error;
    }
  }

  /**
   * Gets payment statistics
   * @param {string} userId - User ID
   * @param {string} period - Period filter
   * @returns {Promise<Object>} - Payment statistics
   */
  async getPaymentStatistics(userId, period = "all") {
    try {
      let query = supabase
        .from("payments")
        .select(
          `
          *,
          subscriptions!inner (user_id)
        `
        )
        .eq("subscriptions.user_id", userId);

      // Apply period filter
      if (period !== "all") {
        const now = new Date();
        let startDate;

        switch (period) {
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case "year":
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          query = query.gte("created_at", startDate.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching payment statistics:", error);
        throw new Error("Failed to fetch payment statistics");
      }

      return PaymentUtils.generatePaymentSummary(data || []);
    } catch (error) {
      logger.error("PaymentService.getPaymentStatistics error:", error);
      throw error;
    }
  }

  /**
   * Processes a refund
   * @param {string} paymentId - Payment ID
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} - Refunded payment
   */
  async processRefund(paymentId, reason) {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (payment.status !== "succeeded") {
        throw new Error("Only successful payments can be refunded");
      }

      const updatedPayment = await this.updatePaymentStatus(
        paymentId,
        "refunded",
        {
          metadata: {
            ...payment.metadata,
            refund_reason: reason,
            refunded_at: new Date().toISOString(),
          },
        }
      );

      logger.info(`Payment refunded: ${paymentId}`);
      return updatedPayment;
    } catch (error) {
      logger.error("PaymentService.processRefund error:", error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
