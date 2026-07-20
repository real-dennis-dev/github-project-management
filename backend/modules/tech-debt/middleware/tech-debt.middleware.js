const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

/**
 * Tech Debt Middleware
 * Provides middleware functions for tech debt routes
 */
class TechDebtMiddleware {
  /**
   * Validates tech debt exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateTechDebtExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid tech debt ID", 400);
      }

      const { data, error } = await supabase
        .from("tech_debt")
        .select("id, project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Tech debt item not found", 404);
      }

      req.techDebt = data;
      next();
    } catch (error) {
      logger.error("Error in validateTechDebtExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if user can modify tech debt
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkModificationPermission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get tech debt with project info
      const { data, error } = await supabase
        .from("tech_debt")
        .select(
          `
          id,
          project_id,
          projects (
            owner_id
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Tech debt item not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this tech debt item"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes tech debt data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeTechDebtData(req, res, next) {
    try {
      const data = req.body;

      if (data.title) {
        data.title = data.title.trim().replace(/<[^>]*>/g, "");
      }

      if (data.description) {
        data.description = data.description.trim().replace(/<[^>]*>/g, "");
      }

      if (data.reason) {
        data.reason = data.reason.trim().replace(/<[^>]*>/g, "");
      }

      if (data.impact) {
        data.impact = data.impact.trim().replace(/<[^>]*>/g, "");
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeTechDebtData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Validates tech debt status transition
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateStatusTransition(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Get current tech debt
      const { data, error } = await supabase
        .from("tech_debt")
        .select("status")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Tech debt item not found", 404);
      }

      const currentStatus = data.status;
      const validTransitions = {
        identified: ["planned", "ignored"],
        planned: ["in_progress", "ignored"],
        in_progress: ["resolved", "ignored"],
        resolved: ["ignored"],
        ignored: ["identified"],
      };

      const allowed = validTransitions[currentStatus] || [];

      if (!allowed.includes(status) && currentStatus !== status) {
        return ResponseUtils.sendError(
          res,
          `Invalid status transition from ${currentStatus} to ${status}`,
          400
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateStatusTransition:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates project has tech debt
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateProjectHasTechDebt(req, res, next) {
    try {
      const { projectId } = req.params;

      const { count, error } = await supabase
        .from("tech_debt")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (error) {
        throw error;
      }

      if (count === 0) {
        return ResponseUtils.sendError(
          res,
          "No tech debt items found for this project",
          404
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateProjectHasTechDebt:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Logs tech debt activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logTechDebtActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Tech Debt Activity", {
        action,
        path,
        userId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
      });
    });

    next();
  }
}

module.exports = new TechDebtMiddleware();
