/**
 * Subscription Utilities
 * Handles subscription-related helper functions
 */
class SubscriptionUtils {
  /**
   * Calculates subscription period end date
   * @param {Date} startDate - Start date
   * @param {string} interval - Subscription interval
   * @param {number} intervalCount - Number of intervals
   * @returns {Date} - End date
   */
  calculatePeriodEnd(startDate, interval, intervalCount = 1) {
    const end = new Date(startDate);

    switch (interval) {
      case "daily":
        end.setDate(end.getDate() + intervalCount);
        break;
      case "weekly":
        end.setDate(end.getDate() + 7 * intervalCount);
        break;
      case "monthly":
        end.setMonth(end.getMonth() + intervalCount);
        break;
      case "quarterly":
        end.setMonth(end.getMonth() + 3 * intervalCount);
        break;
      case "yearly":
        end.setFullYear(end.getFullYear() + intervalCount);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    return end;
  }

  /**
   * Validates subscription status transition
   * @param {string} from - Current status
   * @param {string} to - Target status
   * @returns {boolean} - True if valid transition
   */
  validateStatusTransition(from, to) {
    const validTransitions = {
      inactive: ["active", "trialing", "past_due"],
      trialing: ["active", "expired", "canceled"],
      active: ["past_due", "canceled", "expired"],
      past_due: ["active", "canceled", "expired"],
      canceled: ["inactive", "active"],
      expired: ["inactive", "active"],
    };

    if (from === to) return true;
    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Gets subscription status color
   * @param {string} status - Subscription status
   * @returns {string} - Color code
   */
  getStatusColor(status) {
    const colors = {
      active: "#4CAF50",
      inactive: "#9E9E9E",
      past_due: "#FF9800",
      canceled: "#F44336",
      trialing: "#2196F3",
      expired: "#757575",
    };
    return colors[status] || "#9E9E9E";
  }

  /**
   * Gets subscription status icon
   * @param {string} status - Subscription status
   * @returns {string} - Icon
   */
  getStatusIcon(status) {
    const icons = {
      active: "✅",
      inactive: "⏸️",
      past_due: "⚠️",
      canceled: "❌",
      trialing: "🎯",
      expired: "⌛",
    };
    return icons[status] || "📌";
  }

  /**
   * Checks if subscription is active
   * @param {Object} subscription - Subscription object
   * @returns {boolean} - True if active
   */
  isSubscriptionActive(subscription) {
    const activeStatuses = ["active", "trialing"];
    if (!activeStatuses.includes(subscription.status)) return false;

    // Check if period hasn't ended
    if (subscription.current_period_end) {
      const now = new Date();
      const periodEnd = new Date(subscription.current_period_end);
      if (now > periodEnd) return false;
    }

    return true;
  }

  /**
   * Checks if subscription is expiring soon
   * @param {Object} subscription - Subscription object
   * @param {number} daysThreshold - Days threshold (default: 7)
   * @returns {boolean} - True if expiring soon
   */
  isExpiringSoon(subscription, daysThreshold = 7) {
    if (!subscription.current_period_end) return false;
    if (subscription.status === "canceled") return false;

    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    const daysUntil = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));

    return daysUntil > 0 && daysUntil <= daysThreshold;
  }

  /**
   * Validates subscription data
   * @param {Object} data - Subscription data
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateSubscriptionData(data) {
    const errors = [];

    if (data.interval) {
      const validIntervals = [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
      ];
      if (!validIntervals.includes(data.interval)) {
        errors.push("Invalid subscription interval");
      }
    }

    if (
      data.status &&
      !this.validateStatusTransition(data.status, data.status)
    ) {
      errors.push("Invalid subscription status");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formats subscription for display
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {Object} - Formatted subscription
   */
  formatSubscription(subscription, plan) {
    const isActive = this.isSubscriptionActive(subscription);
    const isExpiring = this.isExpiringSoon(subscription);

    return {
      id: subscription.id,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            type: plan.plan_type,
            price: plan.price,
            billing_cycle: plan.billing_cycle,
          }
        : null,
      status: subscription.status,
      status_label:
        subscription.status.charAt(0).toUpperCase() +
        subscription.status.slice(1).replace("_", " "),
      status_color: this.getStatusColor(subscription.status),
      status_icon: this.getStatusIcon(subscription.status),
      is_active: isActive,
      is_expiring_soon: isExpiring,
      current_period: {
        start: subscription.current_period_start,
        end: subscription.current_period_end,
        days_remaining: subscription.current_period_end
          ? Math.ceil(
              (new Date(subscription.current_period_end) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      },
      trial:
        subscription.trial_start && subscription.trial_end
          ? {
              start: subscription.trial_start,
              end: subscription.trial_end,
              days_remaining: Math.ceil(
                (new Date(subscription.trial_end) - new Date()) /
                  (1000 * 60 * 60 * 24)
              ),
            }
          : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
    };
  }

  /**
   * Generates subscription summary
   * @param {Array} subscriptions - Array of subscriptions
   * @returns {Object} - Subscription summary
   */
  generateSubscriptionSummary(subscriptions) {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        total: 0,
        byStatus: {
          active: 0,
          inactive: 0,
          past_due: 0,
          canceled: 0,
          trialing: 0,
          expired: 0,
        },
        activeCount: 0,
        revenue: { monthly: 0, yearly: 0 },
      };
    }

    const byStatus = subscriptions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {});

    const activeCount = subscriptions.filter((s) =>
      this.isSubscriptionActive(s)
    ).length;
    const activeSubs = subscriptions.filter((s) => s.status === "active");

    // Calculate revenue
    const revenue = activeSubs.reduce(
      (acc, sub) => {
        const price = sub.plans?.price || 0;
        acc.monthly += price;
        if (sub.interval === "yearly") acc.monthly += price / 12;
        if (sub.interval === "quarterly") acc.monthly += price / 3;
        acc.yearly += price * (sub.interval === "yearly" ? 1 : 12);
        return acc;
      },
      { monthly: 0, yearly: 0 }
    );

    return {
      total: subscriptions.length,
      byStatus,
      activeCount,
      revenue: {
        monthly: Math.round(revenue.monthly * 100) / 100,
        yearly: Math.round(revenue.yearly * 100) / 100,
      },
    };
  }

  /**
   * Gets interval options for UI
   * @returns {Array} - Interval options
   */
  getIntervalOptions() {
    return [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "quarterly", label: "Quarterly" },
      { value: "yearly", label: "Yearly" },
    ];
  }

  /**
   * Checks if user has access to a feature
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @param {string} feature - Feature name
   * @returns {boolean} - True if has access
   */
  hasFeatureAccess(subscription, plan, feature) {
    if (!plan || !plan.features) return false;
    return plan.features[feature] === true;
  }

  /**
   * Gets feature limits for subscription
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {Object} - Feature limits
   */
  getFeatureLimits(subscription, plan) {
    if (!plan || !plan.limits) return {};
    return plan.limits;
  }

  /**
   * Formats subscription for AI analysis
   * @param {Object} subscription - Subscription object
   * @param {Object} plan - Plan object
   * @returns {string} - Formatted for AI
   */
  formatForAI(subscription, plan) {
    const isActive = this.isSubscriptionActive(subscription);

    return `
Subscription Status: ${subscription.status.toUpperCase()}
Plan: ${plan?.name || "Unknown"}
Price: $${plan?.price || 0}/${plan?.billing_cycle || "monthly"}
Active: ${isActive ? "Yes" : "No"}
Trial: ${subscription.trial_start ? "Yes" : "No"}
${
  subscription.trial_end
    ? `Trial Ends: ${new Date(subscription.trial_end).toLocaleDateString()}`
    : ""
}
Period Ends: ${
      subscription.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString()
        : "N/A"
    }
    `.trim();
  }
}

module.exports = new SubscriptionUtils();
