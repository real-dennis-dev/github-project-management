const { supabase } = require("../../../common/config/supabase");
const PlanUtils = require("../utils/plan.utils");
const logger = require("../../../common/config/logger");

/**
 * Plan Service
 * Handles business logic for plans
 */
class PlanService {
  /**
   * Gets all plans
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Plans with pagination
   */
  async getPlans(options = {}) {
    try {
      const {
        is_active,
        plan_type,
        page = 1,
        limit = 20,
        sortBy = "sort_order",
        sortOrder = "ASC",
      } = options;

      let query = supabase.from("plans").select("*", { count: "exact" });

      if (is_active !== undefined) {
        query = query.eq("is_active", is_active);
      }

      if (plan_type) {
        const validTypes = ["free", "basic", "pro", "enterprise", "custom"];
        if (validTypes.includes(plan_type)) {
          query = query.eq("plan_type", plan_type);
        }
      }

      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching plans:", error);
        throw new Error("Failed to fetch plans");
      }

      const formattedPlans = (data || []).map((plan) =>
        PlanUtils.formatPlan(plan)
      );

      return {
        data: formattedPlans,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("PlanService.getPlans error:", error);
      throw error;
    }
  }

  /**
   * Gets a plan by ID
   * @param {string} id - Plan ID
   * @returns {Promise<Object>} - Plan object
   */
  async getPlanById(id) {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching plan:", error);
        throw new Error("Plan not found");
      }

      return PlanUtils.formatPlan(data);
    } catch (error) {
      logger.error("PlanService.getPlanById error:", error);
      throw error;
    }
  }

  /**
   * Creates a new plan
   * @param {Object} data - Plan data
   * @returns {Promise<Object>} - Created plan
   */
  async createPlan(data) {
    try {
      // Validate data
      const validation = PlanUtils.validatePlanData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // If this is set as default, unset other defaults
      if (data.is_default) {
        await supabase
          .from("plans")
          .update({ is_default: false })
          .eq("is_default", true);
      }

      // Prepare plan data
      const planData = {
        name: data.name.trim(),
        description: data.description || null,
        plan_type: data.plan_type || "basic",
        price: data.price || 0,
        billing_cycle: data.billing_cycle || "monthly",
        features: data.features || PlanUtils.getDefaultFeatures(data.plan_type),
        limits: data.limits || PlanUtils.getDefaultLimits(data.plan_type),
        is_active: data.is_active !== undefined ? data.is_active : true,
        is_default: data.is_default || false,
        trial_days: data.trial_days || 0,
        sort_order: data.sort_order || 0,
      };

      const { data: plan, error } = await supabase
        .from("plans")
        .insert([planData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating plan:", error);
        throw new Error("Failed to create plan");
      }

      logger.info(`Plan created: ${plan.id} - ${plan.name}`);
      return PlanUtils.formatPlan(plan);
    } catch (error) {
      logger.error("PlanService.createPlan error:", error);
      throw error;
    }
  }

  /**
   * Updates a plan
   * @param {string} id - Plan ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated plan
   */
  async updatePlan(id, data) {
    try {
      // Check if plan exists
      await this.getPlanById(id);

      // Validate data
      const validation = PlanUtils.validatePlanData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // If setting as default, unset other defaults
      if (data.is_default) {
        await supabase
          .from("plans")
          .update({ is_default: false })
          .eq("is_default", true)
          .neq("id", id);
      }

      // Prepare update data
      const updateData = {};

      if (data.name) updateData.name = data.name.trim();
      if (data.description !== undefined) {
        updateData.description = data.description || null;
      }
      if (data.plan_type) updateData.plan_type = data.plan_type;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.billing_cycle) updateData.billing_cycle = data.billing_cycle;
      if (data.features) updateData.features = data.features;
      if (data.limits) updateData.limits = data.limits;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.is_default !== undefined)
        updateData.is_default = data.is_default;
      if (data.trial_days !== undefined)
        updateData.trial_days = data.trial_days;
      if (data.sort_order !== undefined)
        updateData.sort_order = data.sort_order;

      const { data: plan, error } = await supabase
        .from("plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating plan:", error);
        throw new Error("Failed to update plan");
      }

      logger.info(`Plan updated: ${plan.id} - ${plan.name}`);
      return PlanUtils.formatPlan(plan);
    } catch (error) {
      logger.error("PlanService.updatePlan error:", error);
      throw error;
    }
  }

  /**
   * Deletes a plan
   * @param {string} id - Plan ID
   * @returns {Promise<void>}
   */
  async deletePlan(id) {
    try {
      // Check if plan exists
      await this.getPlanById(id);

      // Check if plan is in use
      const { count, error: countError } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan_id", id);

      if (countError) {
        logger.error("Error checking plan usage:", countError);
        throw new Error("Failed to check plan usage");
      }

      if (count > 0) {
        throw new Error("Cannot delete plan that has active subscriptions");
      }

      const { error } = await supabase.from("plans").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting plan:", error);
        throw new Error("Failed to delete plan");
      }

      logger.info(`Plan deleted: ${id}`);
    } catch (error) {
      logger.error("PlanService.deletePlan error:", error);
      throw error;
    }
  }

  /**
   * Gets default plan
   * @returns {Promise<Object>} - Default plan
   */
  async getDefaultPlan() {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_default", true)
        .single();

      if (error) {
        // If no default plan, get the first active plan
        const { data: fallback, error: fallbackError } = await supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true })
          .limit(1)
          .single();

        if (fallbackError) {
          throw new Error("No default plan found");
        }

        return PlanUtils.formatPlan(fallback);
      }

      return PlanUtils.formatPlan(data);
    } catch (error) {
      logger.error("PlanService.getDefaultPlan error:", error);
      throw error;
    }
  }

  /**
   * Gets public plans (active, non-custom)
   * @returns {Promise<Array>} - Public plans
   */
  async getPublicPlans() {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .neq("plan_type", "custom")
        .order("sort_order", { ascending: true });

      if (error) {
        logger.error("Error fetching public plans:", error);
        throw new Error("Failed to fetch public plans");
      }

      return (data || []).map((plan) => PlanUtils.formatPlan(plan));
    } catch (error) {
      logger.error("PlanService.getPublicPlans error:", error);
      throw error;
    }
  }
}

module.exports = new PlanService();
