/**
 * Payment Utilities
 * Handles payment-related helper functions
 */
class PaymentUtils {
  /**
   * Formats currency
   * @param {number} amount - Amount
   * @param {string} currency - Currency code
   * @returns {string} - Formatted currency
   */
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  /**
   * Gets payment status color
   * @param {string} status - Payment status
   * @returns {string} - Color code
   */
  getPaymentStatusColor(status) {
    const colors = {
      pending: "#FFA726",
      succeeded: "#4CAF50",
      failed: "#F44336",
      refunded: "#9E9E9E",
      charged_back: "#D32F2F",
    };
    return colors[status] || "#9E9E9E";
  }

  /**
   * Gets payment status icon
   * @param {string} status - Payment status
   * @returns {string} - Icon
   */
  getPaymentStatusIcon(status) {
    const icons = {
      pending: "⏳",
      succeeded: "✅",
      failed: "❌",
      refunded: "↩️",
      charged_back: "⚠️",
    };
    return icons[status] || "📌";
  }

  /**
   * Gets payment method label
   * @param {string} method - Payment method
   * @returns {string} - Label
   */
  getPaymentMethodLabel(method) {
    const labels = {
      card: "Credit/Debit Card",
      paypal: "PayPal",
      stripe: "Stripe",
      bank_transfer: "Bank Transfer",
      crypto: "Cryptocurrency",
    };
    return labels[method] || method;
  }

  /**
   * Validates payment data
   * @param {Object} data - Payment data
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validatePaymentData(data) {
    const errors = [];

    if (data.amount !== undefined && data.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (data.status) {
      const validStatuses = [
        "pending",
        "succeeded",
        "failed",
        "refunded",
        "charged_back",
      ];
      if (!validStatuses.includes(data.status)) {
        errors.push("Invalid payment status");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generates payment receipt
   * @param {Object} payment - Payment object
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {string} - Receipt text
   */
  generateReceipt(payment, subscription, plan) {
    const receipt = [
      "=".repeat(50),
      "PAYMENT RECEIPT",
      "=".repeat(50),
      `Date: ${new Date(payment.created_at).toLocaleString()}`,
      `Payment ID: ${payment.id}`,
      `Status: ${payment.status.toUpperCase()}`,
      "-".repeat(50),
      `Plan: ${plan?.name || "N/A"}`,
      `Amount: ${this.formatCurrency(payment.amount, payment.currency)}`,
      `Payment Method: ${this.getPaymentMethodLabel(
        payment.payment_method_type
      )}`,
      "-".repeat(50),
      `Subscription ID: ${subscription?.id || "N/A"}`,
      `Period End: ${
        subscription?.current_period_end
          ? new Date(subscription.current_period_end).toLocaleDateString()
          : "N/A"
      }`,
      "=".repeat(50),
      `Receipt Generated: ${new Date().toLocaleString()}`,
    ].join("\n");

    return receipt;
  }

  /**
   * Calculates prorated amount
   * @param {number} amount - Full amount
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} billingCycle - Billing cycle
   * @returns {number} - Prorated amount
   */
  calculateProratedAmount(amount, startDate, endDate, billingCycle) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return amount;
    }

    // Calculate days in cycle
    let totalDays;
    switch (billingCycle) {
      case "monthly":
        totalDays = new Date(
          start.getFullYear(),
          start.getMonth() + 1,
          0
        ).getDate();
        break;
      case "quarterly":
        totalDays = 90;
        break;
      case "yearly":
        totalDays = 365;
        break;
      default:
        totalDays = 30;
    }

    const daysUsed = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const prorated = (amount / totalDays) * daysUsed;

    return Math.round(prorated * 100) / 100;
  }

  /**
   * Formats payment for display
   * @param {Object} payment - Payment object
   * @returns {Object} - Formatted payment
   */
  formatPayment(payment) {
    return {
      id: payment.id,
      subscription_id: payment.subscription_id,
      amount: payment.amount,
      amount_formatted: this.formatCurrency(payment.amount, payment.currency),
      currency: payment.currency || "USD",
      status: payment.status,
      status_label:
        payment.status.charAt(0).toUpperCase() +
        payment.status.slice(1).replace("_", " "),
      status_color: this.getPaymentStatusColor(payment.status),
      status_icon: this.getPaymentStatusIcon(payment.status),
      payment_method_type: payment.payment_method_type,
      payment_method_label: this.getPaymentMethodLabel(
        payment.payment_method_type
      ),
      description: payment.description,
      receipt_url: payment.receipt_url,
      invoice_url: payment.invoice_url,
      paid_at: payment.paid_at,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    };
  }

  /**
   * Generates payment summary
   * @param {Array} payments - Array of payments
   * @returns {Object} - Payment summary
   */
  generatePaymentSummary(payments) {
    if (!payments || payments.length === 0) {
      return {
        total: 0,
        totalAmount: 0,
        byStatus: {
          pending: 0,
          succeeded: 0,
          failed: 0,
          refunded: 0,
          charged_back: 0,
        },
        successRate: 0,
      };
    }

    const byStatus = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const totalAmount = payments
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const succeeded = payments.filter((p) => p.status === "succeeded").length;
    const successRate = Math.round((succeeded / payments.length) * 100);

    return {
      total: payments.length,
      totalAmount,
      totalAmountFormatted: this.formatCurrency(totalAmount),
      byStatus,
      successRate,
      totalPaid: succeeded,
      totalFailed: payments.filter((p) => p.status === "failed").length,
      totalRefunded: payments.filter((p) => p.status === "refunded").length,
    };
  }

  /**
   * Gets currency options
   * @returns {Array} - Currency options
   */
  getCurrencyOptions() {
    return [
      { value: "USD", label: "USD - US Dollar" },
      { value: "EUR", label: "EUR - Euro" },
      { value: "GBP", label: "GBP - British Pound" },
      { value: "CAD", label: "CAD - Canadian Dollar" },
      { value: "AUD", label: "AUD - Australian Dollar" },
    ];
  }
}

const paymentUtils = new PaymentUtils();

module.exports = paymentUtils;
module.exports.paymentUtils = paymentUtils;
