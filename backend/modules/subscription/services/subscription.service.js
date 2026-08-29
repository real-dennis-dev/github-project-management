const { supabase } = require("../../../common/config/supabase");
const SubscriptionUtils = require("../utils/subscription.utils");
const PlanUtils = require("../utils/plan.utils");
const logger = require("../../../common/config/logger");

/**
 * Subscription Service
 * Handles business logic for subscriptions
 */
class SubscriptionService {
  /**
   * Gets subscriptions for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Subscriptions with pagination
   */
  async getUserSubscriptions(userId, options = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      let query = supabase
        .from("subscriptions")
        .select(
          `
          *,
          plans (*)
        `,
          { count: "exact" }
        )
        .eq("user_id", userId);

      if (status) {
        const validStatuses = [
          "active",
          "inactive",
          "past_due",
          "canceled",
          "trialing",
          "expired",
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
        logger.error("Error fetching subscriptions:", error);
        throw new Error("Failed to fetch subscriptions");
      }

      const formattedSubscriptions = (data || []).map((sub) =>
        SubscriptionUtils.formatSubscription(sub, sub.plans)
      );

      return {
        data: formattedSubscriptions,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        summary: SubscriptionUtils.generateSubscriptionSummary(data || []),
      };
    } catch (error) {
      logger.error("SubscriptionService.getUserSubscriptions error:", error);
      throw error;
    }
  }

  /**
   * Creates a new subscription
   * @param {string} userId - User ID
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Created subscription
   */
  async createSubscription(userId, data) {
    try {
      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", data.plan_id)
        .single();

      if (planError || !plan) {
        throw new Error("Plan not found");
      }

      // Check if user already has active subscription
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("user_id", userId)
        .in("status", ["active", "trialing"])
        .single();

      if (existing) {
        throw new Error("User already has an active subscription");
      }

      // Calculate trial period
      const trialDays = data.trial_days || plan.trial_days || 0;
      const now = new Date();
      const trialEnd =
        trialDays > 0
          ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
          : null;

      // Calculate period end
      const periodEnd = SubscriptionUtils.calculatePeriodEnd(
        now,
        data.interval || "monthly"
      );

      // Prepare subscription data
      const subscriptionData = {
        user_id: userId,
        plan_id: data.plan_id,
        status: trialDays > 0 ? "trialing" : "active",
        interval: data.interval || "monthly",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_start: trialDays > 0 ? now.toISOString() : null,
        trial_end: trialEnd ? trialEnd.toISOString() : null,
        payment_method_id: data.payment_method_id || null,
        metadata: data.metadata || {},
      };

      // Create subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .insert([subscriptionData])
        .select(
          `
          *,
          plans (*)
        `
        )
        .single();

      if (error) {
        logger.error("Error creating subscription:", error);
        throw new Error("Failed to create subscription");
      }

      logger.info(`Subscription created for user ${userId}`);

      // Log feature usage initialization
      await this.initializeFeatureUsage(userId, plan);

      return SubscriptionUtils.formatSubscription(
        subscription,
        subscription.plans
      );
    } catch (error) {
      logger.error("SubscriptionService.createSubscription error:", error);
      throw error;
    }
  }

  /**
   * Gets a subscription by ID
   * @param {string} id - Subscription ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Subscription object
   */
  async getSubscriptionById(id, userId) {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          `
          *,
          plans (*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching subscription:", error);
        throw new Error("Subscription not found");
      }

      // Check if user owns this subscription
      if (data.user_id !== userId) {
        throw new Error("Unauthorized access to subscription");
      }

      return SubscriptionUtils.formatSubscription(data, data.plans);
    } catch (error) {
      logger.error("SubscriptionService.getSubscriptionById error:", error);
      throw error;
    }
  }

  /**
   * Updates a subscription
   * @param {string} id - Subscription ID
   * @param {string} userId - User ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated subscription
   */
  async updateSubscription(id, userId, data) {
    try {
      // Check subscription exists and belongs to user
      const existing = await this.getSubscriptionById(id, userId);

      // Validate plan change if provided
      if (data.plan_id && data.plan_id !== existing.id) {
        const { data: plan, error } = await supabase
          .from("plans")
          .select("*")
          .eq("id", data.plan_id)
          .single();

        if (error || !plan) {
          throw new Error("Plan not found");
        }
      }

      // Prepare update data
      const updateData = {};

      if (data.plan_id) updateData.plan_id = data.plan_id;
      if (data.interval) {
        const validIntervals = [
          "daily",
          "weekly",
          "monthly",
          "quarterly",
          "yearly",
        ];
        if (!validIntervals.includes(data.interval)) {
          throw new Error("Invalid interval");
        }
        updateData.interval = data.interval;
      }
      if (data.cancel_at_period_end !== undefined) {
        updateData.cancel_at_period_end = data.cancel_at_period_end;
        if (data.cancel_at_period_end) {
          updateData.canceled_at = new Date().toISOString();
        } else {
          updateData.canceled_at = null;
        }
      }
      if (data.payment_method_id !== undefined) {
        updateData.payment_method_id = data.payment_method_id;
      }
      if (data.metadata) {
        updateData.metadata = { ...existing.metadata, ...data.metadata };
      }

      // Update subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          plans (*)
        `
        )
        .single();

      if (error) {
        logger.error("Error updating subscription:", error);
        throw new Error("Failed to update subscription");
      }

      logger.info(`Subscription updated: ${id}`);
      return SubscriptionUtils.formatSubscription(
        subscription,
        subscription.plans
      );
    } catch (error) {
      logger.error("SubscriptionService.updateSubscription error:", error);
      throw error;
    }
  }

  /**
   * Cancels a subscription
   * @param {string} id - Subscription ID
   * @param {string} userId - User ID
   * @param {Object} data - Cancel data
   * @returns {Promise<Object>} - Cancelled subscription
   */
  async cancelSubscription(id, userId, data = {}) {
    try {
      const existing = await this.getSubscriptionById(id, userId);

      const updateData = {
        cancel_at_period_end:
          data.cancel_at_period_end !== undefined
            ? data.cancel_at_period_end
            : true,
        canceled_at: new Date().toISOString(),
      };

      if (data.cancel_at_period_end === false) {
        updateData.canceled_at = null;
      }

      if (data.reason) {
        updateData.metadata = {
          ...existing.metadata,
          cancellation_reason: data.reason,
          canceled_at: new Date().toISOString(),
        };
      }

      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          plans (*)
        `
        )
        .single();

      if (error) {
        logger.error("Error cancelling subscription:", error);
        throw new Error("Failed to cancel subscription");
      }

      logger.info(`Subscription cancelled: ${id}`);
      return SubscriptionUtils.formatSubscription(
        subscription,
        subscription.plans
      );
    } catch (error) {
      logger.error("SubscriptionService.cancelSubscription error:", error);
      throw error;
    }
  }

  /**
   * Gets current subscription for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Current subscription
   */
  async getCurrentSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          `
          *,
          plans (*)
        `
        )
        .eq("user_id", userId)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        logger.error("Error fetching current subscription:", error);
        throw new Error("Failed to fetch current subscription");
      }

      if (!data) return null;

      return SubscriptionUtils.formatSubscription(data, data.plans);
    } catch (error) {
      logger.error("SubscriptionService.getCurrentSubscription error:", error);
      throw error;
    }
  }

  /**
   * Initializes feature usage for a user
   * @param {string} userId - User ID
   * @param {Object} plan - Plan object
   * @returns {Promise<void>}
   */
  async initializeFeatureUsage(userId, plan) {
    try {
      const limits = plan.limits || PlanUtils.getDefaultLimits(plan.plan_type);

      const features = Object.keys(limits).map((featureName) => ({
        user_id: userId,
        feature_name: featureName,
        max_count: limits[featureName],
        used_count: 0,
      }));

      const { error } = await supabase
        .from("feature_usage")
        .upsert(features, { onConflict: "user_id, feature_name" });

      if (error) {
        logger.error("Error initializing feature usage:", error);
      }
    } catch (error) {
      logger.error("SubscriptionService.initializeFeatureUsage error:", error);
    }
  }

  /**
   * Checks feature usage
   * @param {string} userId - User ID
   * @param {string} featureName - Feature name
   * @param {number} increment - Amount to increment
   * @returns {Promise<Object>} - Usage status
   */
  async checkFeatureUsage(userId, featureName, increment = 1) {
    try {
      // Get current usage
      let { data: usage, error } = await supabase
        .from("feature_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("feature_name", featureName)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!usage) {
        // Get user's current subscription to set limits
        const subscription = await this.getCurrentSubscription(userId);
        if (!subscription) {
          return { allowed: false, message: "No active subscription" };
        }

        const plan = subscription.plans;
        const limits =
          plan.limits || PlanUtils.getDefaultLimits(plan.plan_type);
        const maxCount = limits[featureName] || 0;

        // Create usage record
        const { data: newUsage, error: insertError } = await supabase
          .from("feature_usage")
          .insert([
            {
              user_id: userId,
              feature_name: featureName,
              max_count: maxCount,
              used_count: 0,
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        usage = newUsage;
      }

      const maxCount = usage.max_count;
      const usedCount = usage.used_count;

      // Check if unlimited (-1)
      if (maxCount === -1) {
        return { allowed: true, usage: usedCount, maxCount, unlimited: true };
      }

      // Check if limit reached
      const allowed = usedCount + increment <= maxCount;

      return {
        allowed,
        usage: usedCount,
        maxCount,
        unlimited: false,
        remaining: Math.max(0, maxCount - usedCount),
      };
    } catch (error) {
      logger.error("SubscriptionService.checkFeatureUsage error:", error);
      return { allowed: false, message: "Error checking feature usage" };
    }
  }

  /**
   * Increments feature usage
   * @param {string} userId - User ID
   * @param {string} featureName - Feature name
   * @param {number} increment - Amount to increment
   * @returns {Promise<Object>} - Updated usage
   */
  async incrementFeatureUsage(userId, featureName, increment = 1) {
    try {
      // Check if feature usage exists
      const { data: usage, error: fetchError } = await supabase
        .from("feature_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("feature_name", featureName)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!usage) {
        // Initialize usage
        await this.initializeFeatureUsage(userId, { plan_type: "free" });

        // Fetch again
        const { data: newUsage, error: newError } = await supabase
          .from("feature_usage")
          .select("*")
          .eq("user_id", userId)
          .eq("feature_name", featureName)
          .single();

        if (newError) throw newError;
        usage = newUsage;
      }

      // Check if unlimited
      if (usage.max_count === -1) {
        return {
          allowed: true,
          usage: usage.used_count,
          maxCount: usage.max_count,
          unlimited: true,
        };
      }

      // Check if limit reached
      if (usage.used_count + increment > usage.max_count) {
        return {
          allowed: false,
          usage: usage.used_count,
          maxCount: usage.max_count,
          unlimited: false,
          message: "Feature usage limit reached",
        };
      }

      // Update usage
      const { data, error } = await supabase
        .from("feature_usage")
        .update({ used_count: usage.used_count + increment })
        .eq("id", usage.id)
        .select()
        .single();

      if (error) throw error;

      return {
        allowed: true,
        usage: data.used_count,
        maxCount: data.max_count,
        unlimited: false,
        remaining: data.max_count - data.used_count,
      };
    } catch (error) {
      logger.error("SubscriptionService.incrementFeatureUsage error:", error);
      throw error;
    }
  }

  /**
   * Gets feature usage for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Feature usage
   */
  async getFeatureUsage(userId) {
    try {
      const { data, error } = await supabase
        .from("feature_usage")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        logger.error("Error fetching feature usage:", error);
        throw new Error("Failed to fetch feature usage");
      }

      return data || [];
    } catch (error) {
      logger.error("SubscriptionService.getFeatureUsage error:", error);
      throw error;
    }
  }
}

const subscriptionService = new SubscriptionService();

module.exports = subscriptionService;
module.exports.subscriptionService = subscriptionService;
