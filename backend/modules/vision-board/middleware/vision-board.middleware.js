const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

/**
 * Vision Board Middleware
 * Provides middleware functions for vision goal routes
 */
class VisionBoardMiddleware {
  /**
   * Validates vision goal exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateVisionGoalExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      const { data, error } = await supabase
        .from("vision_board")
        .select("id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Vision goal not found", 404);
      }

      req.visionGoal = data;
      next();
    } catch (error) {
      logger.error("Error in validateVisionGoalExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates project exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateProjectExists(req, res, next) {
    try {
      const { projectId } = req.params;
      const { project_id } = req.body;

      const id = projectId || project_id;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Project not found", 404);
      }

      req.project = data;
      next();
    } catch (error) {
      logger.error("Error in validateProjectExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates link doesn't already exist
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateLinkNotExists(req, res, next) {
    try {
      const { id } = req.params;
      const { project_id } = req.body;

      const { data, error } = await supabase
        .from("vision_projects")
        .select("id")
        .eq("vision_id", id)
        .eq("project_id", project_id)
        .single();

      if (data) {
        return ResponseUtils.sendError(
          res,
          "Project already linked to this vision goal",
          400
        );
      }

      next();
    } catch (error) {
      // If error is 'PGRST116' (not found), that's what we want
      if (error.code === "PGRST116") {
        return next();
      }

      logger.error("Error in validateLinkNotExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates link exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateLinkExists(req, res, next) {
    try {
      const { id, projectId } = req.params;

      const { data, error } = await supabase
        .from("vision_projects")
        .select("id")
        .eq("vision_id", id)
        .eq("project_id", projectId)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Link not found", 404);
      }

      req.link = data;
      next();
    } catch (error) {
      logger.error("Error in validateLinkExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes vision goal data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeGoalData(req, res, next) {
    try {
      const data = req.body;

      if (data.goal) {
        data.goal = data.goal.trim().replace(/<[^>]*>/g, "");
      }

      if (data.description) {
        data.description = data.description.trim().replace(/<[^>]*>/g, "");
      }

      if (data.target_timeline) {
        data.target_timeline = data.target_timeline
          .trim()
          .replace(/<[^>]*>/g, "");
      }

      if (data.category) {
        data.category = data.category.trim().replace(/<[^>]*>/g, "");
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeGoalData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Checks if user can modify vision goal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkModificationPermission(req, res, next) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Admin and project managers can modify all goals
      if (userRole === "admin" || userRole === "project_manager") {
        return next();
      }

      // Get goal with owner info
      const { data, error } = await supabase
        .from("vision_board")
        .select("created_by")
        .eq("id", req.params.id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Vision goal not found", 404);
      }

      // Check if user is the creator
      if (data.created_by !== userId) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this vision goal"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Logs vision board activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logVisionActivity(req, res, next) {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Vision Board Activity", {
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

const visionBoardMiddleware = new VisionBoardMiddleware();

module.exports = visionBoardMiddleware;
module.exports.visionBoardMiddleware = visionBoardMiddleware;
