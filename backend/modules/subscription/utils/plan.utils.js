/**
 * Plan Utilities
 * Handles plan-related helper functions
 */
class PlanUtils {
  /**
   * Validates plan features
   * @param {Object} features - Features object
   * @returns {boolean} - True if valid
   */
  validateFeatures(features) {
    if (!features || typeof features !== "object") return false;

    // Check if all values are boolean
    const allBooleans = Object.values(features).every(
      (v) => typeof v === "boolean"
    );
    return allBooleans;
  }

  /**
   * Validates plan limits
   * @param {Object} limits - Limits object
   * @returns {boolean} - True if valid
   */
  validateLimits(limits) {
    if (!limits || typeof limits !== "object") return false;

    // Check if all values are numbers
    const allNumbers = Object.values(limits).every(
      (v) => typeof v === "number" && v >= 0
    );
    return allNumbers;
  }

  /**
   * Gets plan type label
   * @param {string} type - Plan type
   * @returns {string} - Label
   */
  getPlanTypeLabel(type) {
    const labels = {
      free: "Free",
      basic: "Basic",
      pro: "Pro",
      enterprise: "Enterprise",
      custom: "Custom",
    };
    return labels[type] || type;
  }

  /**
   * Gets plan type color
   * @param {string} type - Plan type
   * @returns {string} - Color code
   */
  getPlanTypeColor(type) {
    const colors = {
      free: "#9E9E9E",
      basic: "#2196F3",
      pro: "#FF9800",
      enterprise: "#9C27B0",
      custom: "#4CAF50",
    };
    return colors[type] || "#9E9E9E";
  }

  /**
   * Gets plan type icon
   * @param {string} type - Plan type
   * @returns {string} - Icon
   */
  getPlanTypeIcon(type) {
    const icons = {
      free: "🆓",
      basic: "📋",
      pro: "⭐",
      enterprise: "🏢",
      custom: "🎯",
    };
    return icons[type] || "📌";
  }

  /**
   * Gets billing cycle label
   * @param {string} cycle - Billing cycle
   * @returns {string} - Label
   */
  getBillingCycleLabel(cycle) {
    const labels = {
      monthly: "Monthly",
      yearly: "Yearly",
      quarterly: "Quarterly",
    };
    return labels[cycle] || cycle;
  }

  /**
   * Formats price for display
   * @param {number} price - Price
   * @param {string} currency - Currency code
   * @param {string} cycle - Billing cycle
   * @returns {string} - Formatted price
   */
  formatPrice(price, currency = "USD", cycle = "monthly") {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);

    if (price === 0) return "Free";
    return `${formatted}/${this.getBillingCycleLabel(cycle).toLowerCase()}`;
  }

  /**
   * Gets feature comparison between plans
   * @param {Array} plans - Array of plans
   * @returns {Object} - Feature comparison
   */
  getFeatureComparison(plans) {
    if (!plans || plans.length === 0) return {};

    // Get all unique features
    const allFeatures = new Set();
    plans.forEach((plan) => {
      if (plan.features) {
        Object.keys(plan.features).forEach((f) => allFeatures.add(f));
      }
    });

    // Build comparison matrix
    const comparison = {};
    allFeatures.forEach((feature) => {
      comparison[feature] = plans.map((plan) => ({
        planId: plan.id,
        planName: plan.name,
        hasFeature: plan.features?.[feature] || false,
      }));
    });

    return comparison;
  }

  /**
   * Gets default plan limits
   * @param {string} type - Plan type
   * @returns {Object} - Default limits
   */
  getDefaultLimits(type) {
    const defaults = {
      free: {
        projects: 3,
        features: 10,
        team_members: 1,
        storage_gb: 1,
        api_calls: 1000,
      },
      basic: {
        projects: 10,
        features: 50,
        team_members: 5,
        storage_gb: 10,
        api_calls: 10000,
      },
      pro: {
        projects: 50,
        features: 200,
        team_members: 20,
        storage_gb: 50,
        api_calls: 100000,
      },
      enterprise: {
        projects: -1, // Unlimited
        features: -1, // Unlimited
        team_members: -1, // Unlimited
        storage_gb: 1000,
        api_calls: -1, // Unlimited
      },
      custom: {
        projects: -1,
        features: -1,
        team_members: -1,
        storage_gb: -1,
        api_calls: -1,
      },
    };

    return defaults[type] || defaults.free;
  }

  /**
   * Gets default features
   * @param {string} type - Plan type
   * @returns {Object} - Default features
   */
  getDefaultFeatures(type) {
    const baseFeatures = {
      api_access: true,
      dashboard: true,
      notifications: true,
    };

    const features = {
      free: {
        ...baseFeatures,
        advanced_analytics: false,
        team_collaboration: false,
        custom_domains: false,
        priority_support: false,
      },
      basic: {
        ...baseFeatures,
        advanced_analytics: true,
        team_collaboration: false,
        custom_domains: false,
        priority_support: false,
      },
      pro: {
        ...baseFeatures,
        advanced_analytics: true,
        team_collaboration: true,
        custom_domains: true,
        priority_support: false,
      },
      enterprise: {
        ...baseFeatures,
        advanced_analytics: true,
        team_collaboration: true,
        custom_domains: true,
        priority_support: true,
        sla_guarantee: true,
        dedicated_support: true,
        custom_integrations: true,
      },
      custom: {
        ...baseFeatures,
        advanced_analytics: true,
        team_collaboration: true,
        custom_domains: true,
        priority_support: true,
        sla_guarantee: true,
        dedicated_support: true,
        custom_integrations: true,
      },
    };

    return features[type] || features.free;
  }

  /**
   * Validates plan data
   * @param {Object} data - Plan data
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validatePlanData(data) {
    const errors = [];

    if (data.name && data.name.length < 3) {
      errors.push("Plan name must be at least 3 characters");
    }

    if (data.price !== undefined && data.price < 0) {
      errors.push("Price must be non-negative");
    }

    if (data.trial_days !== undefined && data.trial_days < 0) {
      errors.push("Trial days must be non-negative");
    }

    if (data.features && !this.validateFeatures(data.features)) {
      errors.push(
        "Invalid features format (must be object with boolean values)"
      );
    }

    if (data.limits && !this.validateLimits(data.limits)) {
      errors.push("Invalid limits format (must be object with number values)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets plan options for UI
   * @returns {Object} - Plan options
   */
  getPlanOptions() {
    return {
      types: [
        { value: "free", label: "Free", color: "#9E9E9E" },
        { value: "basic", label: "Basic", color: "#2196F3" },
        { value: "pro", label: "Pro", color: "#FF9800" },
        { value: "enterprise", label: "Enterprise", color: "#9C27B0" },
        { value: "custom", label: "Custom", color: "#4CAF50" },
      ],
      billingCycles: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "yearly", label: "Yearly" },
      ],
    };
  }

  /**
   * Formats plan for display
   * @param {Object} plan - Plan object
   * @returns {Object} - Formatted plan
   */
  formatPlan(plan) {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      type: plan.plan_type,
      type_label: this.getPlanTypeLabel(plan.plan_type),
      type_color: this.getPlanTypeColor(plan.plan_type),
      type_icon: this.getPlanTypeIcon(plan.plan_type),
      price: plan.price,
      price_formatted: this.formatPrice(plan.price, "USD", plan.billing_cycle),
      billing_cycle: plan.billing_cycle,
      billing_cycle_label: this.getBillingCycleLabel(plan.billing_cycle),
      features: plan.features || {},
      limits: plan.limits || {},
      is_active: plan.is_active,
      is_default: plan.is_default,
      trial_days: plan.trial_days,
      sort_order: plan.sort_order,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    };
  }
}

module.exports = new PlanUtils();
