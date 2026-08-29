const PlanService = require("../services/plan.service");
const PlanUtils = require("../utils/plan.utils");
const { planSchemas } = require("../validations/subscription.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Plan Controller
 * Handles HTTP requests for plans
 */
class PlanController {
  /**
   * Get all plans
   */
  async getPlans(req, res) {
    try {
      const queryParams = req.query;

      const result = await PlanService.getPlans(queryParams);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Plans retrieved successfully",
        200,
        { pagination: result.pagination }
      );
    } catch (error) {
      logger.error("Error in getPlans:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get public plans
   */
  async getPublicPlans(req, res) {
    try {
      const plans = await PlanService.getPublicPlans();

      return ResponseUtils.sendSuccess(
        res,
        plans,
        "Public plans retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getPublicPlans:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(req, res) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid plan ID", 400);
      }

      const plan = await PlanService.getPlanById(id);

      return ResponseUtils.sendSuccess(
        res,
        plan,
        "Plan retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getPlanById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Create a new plan
   */
  async createPlan(req, res) {
    try {
      const data = req.body;

      const { error, value } = planSchemas.createPlan.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const plan = await PlanService.createPlan(value);

      return ResponseUtils.sendSuccess(
        res,
        plan,
        "Plan created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createPlan:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Update a plan
   */
  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid plan ID", 400);
      }

      const { error, value } = planSchemas.updatePlan.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const plan = await PlanService.updatePlan(id, value);

      return ResponseUtils.sendSuccess(res, plan, "Plan updated successfully");
    } catch (error) {
      logger.error("Error in updatePlan:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a plan
   */
  async deletePlan(req, res) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid plan ID", 400);
      }

      await PlanService.deletePlan(id);

      return ResponseUtils.sendSuccess(res, null, "Plan deleted successfully");
    } catch (error) {
      logger.error("Error in deletePlan:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get default plan
   */
  async getDefaultPlan(req, res) {
    try {
      const plan = await PlanService.getDefaultPlan();

      return ResponseUtils.sendSuccess(
        res,
        plan,
        "Default plan retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDefaultPlan:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get plan options
   */
  async getPlanOptions(req, res) {
    try {
      const options = PlanUtils.getPlanOptions();

      return ResponseUtils.sendSuccess(
        res,
        options,
        "Plan options retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getPlanOptions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

const planController = new PlanController();

module.exports = planController;
module.exports.planController = planController;
