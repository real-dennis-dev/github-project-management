const { supabase } = require("../../../common/config/supabase");
const { ResponseUtils } = require("../../../common/utils/response.utils");
const { ValidationUtils } = require("../../../common/utils/validation.utils");
const { Logger } = require("../../../common/config/logger");

const response = new ResponseUtils();
const logger = Logger;

class FeatureMiddleware {
  // methods here

  /**
   * Validates feature exists
   */
  async validateFeatureId(req, res, next) {
    try {
      const id = req.params.id || req.params.featureId;

      if (!id) {
        return response.sendValidationError(res, ["Feature ID is required"]);
      }

      if (!ValidationUtils.validateUUID(id)) {
        return response.sendValidationError(res, ["Invalid feature ID format"]);
      }

      const { data, error } = await supabase
        .from("features")
        .select("id, project_id, title")
        .eq("id", id)
        .single();

      if (error || !data) {
        logger.warn(`Feature not found: ${id}`);
        return response.sendError(res, "Feature not found", 404);
      }

      req.feature = data;
      next();
    } catch (error) {
      logger.error("Error in validateFeatureId:", error);
      next(error);
    }
  }

  /**
   * Checks if feature belongs to project
   */
  async checkFeatureOwnership(req, res, next) {
    try {
      const featureId = req.params.id || req.params.featureId;
      const projectId = req.params.projectId || req.feature?.project_id;

      if (!featureId || !projectId) {
        return response.sendValidationError(res, [
          "Feature and project IDs are required",
        ]);
      }

      const { data, error } = await supabase
        .from("features")
        .select("id")
        .eq("id", featureId)
        .eq("project_id", projectId)
        .single();

      if (error || !data) {
        logger.warn(
          `Feature ${featureId} does not belong to project ${projectId}`
        );
        return response.sendForbidden(
          res,
          "Feature does not belong to this project"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkFeatureOwnership:", error);
      next(error);
    }
  }

  /**
   * Validates feature data
   */
  validateFeatureData(req, res, next) {
    try {
      const data = req.body;
      const errors = [];

      // Check required fields
      if (req.method === "POST" && (!data.title || data.title.trim() === "")) {
        errors.push("Title is required");
      }

      // Validate status if provided
      if (
        data.status &&
        !ValidationUtils.validateEnum(data.status, [
          "planned",
          "in_progress",
          "completed",
          "blocked",
          "cancelled",
        ])
      ) {
        errors.push(
          "Invalid status. Must be one of: planned, in_progress, completed, blocked, cancelled"
        );
      }

      // Validate difficulty if provided
      if (
        data.difficulty &&
        !ValidationUtils.validateEnum(data.difficulty, [
          "easy",
          "medium",
          "hard",
          "expert",
        ])
      ) {
        errors.push(
          "Invalid difficulty. Must be one of: easy, medium, hard, expert"
        );
      }

      // Validate estimated days if provided
      if (data.estimated_days !== undefined && data.estimated_days <= 0) {
        errors.push("Estimated days must be greater than 0");
      }

      if (errors.length > 0) {
        return response.sendValidationError(res, errors);
      }

      next();
    } catch (error) {
      logger.error("Error in validateFeatureData:", error);
      next(error);
    }
  }

  /**
   * Validates subtask data
   */
  validateSubtaskData(req, res, next) {
    try {
      const data = req.body;
      const errors = [];

      if (req.method === "POST" && (!data.title || data.title.trim() === "")) {
        errors.push("Title is required");
      }

      if (
        data.is_completed !== undefined &&
        typeof data.is_completed !== "boolean"
      ) {
        errors.push("is_completed must be a boolean");
      }

      if (errors.length > 0) {
        return response.sendValidationError(res, errors);
      }

      next();
    } catch (error) {
      logger.error("Error in validateSubtaskData:", error);
      next(error);
    }
  }
}
module.exports = {
  FeatureMiddleware,
};
