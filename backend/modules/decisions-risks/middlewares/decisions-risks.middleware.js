const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

/**
 * Decisions & Risks Middleware
 * Provides middleware functions for decision and risk routes
 */
class DecisionsRisksMiddleware {
  /**
   * Validates decision exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateDecisionExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid decision ID", 400);
      }

      const { data, error } = await supabase
        .from("decisions")
        .select("id, project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Decision not found", 404);
      }

      req.decision = data;
      next();
    } catch (error) {
      logger.error("Error in validateDecisionExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates risk exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateRiskExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid risk ID", 400);
      }

      const { data, error } = await supabase
        .from("risks")
        .select("id, project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Risk not found", 404);
      }

      req.risk = data;
      next();
    } catch (error) {
      logger.error("Error in validateRiskExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates project has decisions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateProjectHasDecisions(req, res, next) {
    try {
      const { projectId } = req.params;

      const { count, error } = await supabase
        .from("decisions")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (error) {
        throw error;
      }

      if (count === 0) {
        return ResponseUtils.sendError(
          res,
          "No decisions found for this project",
          404
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateProjectHasDecisions:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates project has risks
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateProjectHasRisks(req, res, next) {
    try {
      const { projectId } = req.params;

      const { count, error } = await supabase
        .from("risks")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (error) {
        throw error;
      }

      if (count === 0) {
        return ResponseUtils.sendError(
          res,
          "No risks found for this project",
          404
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateProjectHasRisks:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if user can modify decision
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkDecisionModificationPermission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get decision with project info
      const { data, error } = await supabase
        .from("decisions")
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
        return ResponseUtils.sendError(res, "Decision not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this decision"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkDecisionModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if user can modify risk
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkRiskModificationPermission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get risk with project info
      const { data, error } = await supabase
        .from("risks")
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
        return ResponseUtils.sendError(res, "Risk not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this risk"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkRiskModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes decision data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeDecisionData(req, res, next) {
    try {
      const data = req.body;

      if (data.title) {
        data.title = data.title.trim().replace(/<[^>]*>/g, "");
      }

      if (data.description) {
        data.description = data.description.trim().replace(/<[^>]*>/g, "");
      }

      if (data.decision) {
        data.decision = data.decision.trim().replace(/<[^>]*>/g, "");
      }

      if (data.reason) {
        data.reason = data.reason.trim().replace(/<[^>]*>/g, "");
      }

      if (data.alternatives) {
        data.alternatives = data.alternatives.trim().replace(/<[^>]*>/g, "");
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeDecisionData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Sanitizes risk data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeRiskData(req, res, next) {
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

      if (data.mitigation) {
        data.mitigation = data.mitigation.trim().replace(/<[^>]*>/g, "");
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeRiskData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Logs decision activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logDecisionActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Decision Activity", {
        action,
        path,
        userId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
      });
    });

    next();
  }

  /**
   * Logs risk activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logRiskActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Risk Activity", {
        action,
        path,
        userId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
      });
    });

    next();
  }
}

const decisionsRisksMiddleware = new DecisionsRisksMiddleware();

module.exports = decisionsRisksMiddleware;
module.exports.decisionsRisksMiddleware = decisionsRisksMiddleware;
