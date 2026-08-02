const { supabase } = require("../../../common/config/supabase");
const ResponseUtils = require("../../../common/utils/response.utils");
const { ValidationUtils } = require("../../../common/utils/validation.utils");
const { Logger } = require("../../../common/config/logger");

const response = ResponseUtils;
const logger = Logger;

class ProjectMiddleware {
  // your middleware methods here

  /**
   * Validates UUID format and project existence
   */
  async validateProjectId(req, res, next) {
    try {
      const id = req.params.id || req.params.projectId;

      if (!id) {
        return response.sendValidationError(res, ["Project ID is required"]);
      }

      if (!ValidationUtils.validateUUID(id)) {
        return response.sendValidationError(res, ["Invalid project ID format"]);
      }

      // Check if project exists
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", id)
        .single();

      if (error || !data) {
        logger.warn(`Project not found: ${id}`);
        return response.sendError(res, "Project not found", 404);
      }

      // Attach project to request for downstream use
      req.project = data;
      next();
    } catch (error) {
      logger.error("Error in validateProjectId:", error);
      next(error);
    }
  }

  /**
   * Checks user permissions for project access
   */
  async checkProjectAccess(req, res, next) {
    try {
      const userId = req.user?.id;
      const projectId = req.params.id || req.params.projectId;

      if (!userId) {
        return response.sendUnauthorized(res, "User not authenticated");
      }

      // Check if user has access to project
      // This is a placeholder - implement based on your auth system
      const { data, error } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        logger.warn(
          `User ${userId} attempted to access project ${projectId} without permission`
        );
        return response.sendForbidden(
          res,
          "You do not have access to this project"
        );
      }

      // Attach user role to request
      req.userRole = data.role;
      next();
    } catch (error) {
      logger.error("Error in checkProjectAccess:", error);
      next(error);
    }
  }

  /**
   * Validates project input data
   */
  validateProjectInput(req, res, next) {
    try {
      const data = req.body;

      // Check required fields
      const requiredFields = ["name"];
      const errors = [];

      requiredFields.forEach((field) => {
        if (!data[field] || data[field].trim() === "") {
          errors.push(`${field} is required`);
        }
      });

      // Validate status if provided
      if (
        data.status &&
        !ValidationUtils.validateEnum(data.status, [
          "planning",
          "in_progress",
          "paused",
          "completed",
          "archived",
        ])
      ) {
        errors.push(
          "Invalid status. Must be one of: planning, in_progress, paused, completed, archived"
        );
      }

      // Validate priority if provided
      if (
        data.priority &&
        !ValidationUtils.validateEnum(data.priority, [
          "low",
          "medium",
          "high",
          "critical",
        ])
      ) {
        errors.push(
          "Invalid priority. Must be one of: low, medium, high, critical"
        );
      }

      // Validate completion percentage if provided
      if (data.completion_percentage !== undefined) {
        if (
          data.completion_percentage < 0 ||
          data.completion_percentage > 100
        ) {
          errors.push("Completion percentage must be between 0 and 100");
        }
      }

      // Validate dates if provided
      if (data.start_date && !ValidationUtils.validateDate(data.start_date)) {
        errors.push("Invalid start date format");
      }

      if (
        data.target_completion_date &&
        !ValidationUtils.validateDate(data.target_completion_date)
      ) {
        errors.push("Invalid target completion date format");
      }

      // Validate repository URL if provided
      if (
        data.repository_url &&
        !ValidationUtils.validateURL(data.repository_url)
      ) {
        errors.push("Invalid repository URL");
      }

      if (errors.length > 0) {
        return response.sendValidationError(res, errors);
      }

      next();
    } catch (error) {
      logger.error("Error in validateProjectInput:", error);
      next(error);
    }
  }

  /**
   * Sanitizes HTML and SQL injection
   */
  sanitizeProjectData(req, res, next) {
    try {
      const data = req.body;

      if (data.name) {
        data.name = data.name.trim().replace(/[<>]/g, "");
      }

      if (data.description) {
        data.description = data.description.trim();
      }

      if (data.tech_stack && Array.isArray(data.tech_stack)) {
        data.tech_stack = data.tech_stack.map((item) => item.trim());
      }

      if (data.repository_url) {
        data.repository_url = data.repository_url.trim();
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeProjectData:", error);
      next(error);
    }
  }
}
module.exports = {
  ProjectMiddleware,
};
