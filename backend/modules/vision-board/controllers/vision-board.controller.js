const VisionBoardService = require("../services/vision-board.service");
const VisionUtils = require("../utils/vision.utils");
const { visionSchemas } = require("../validations/vision-board.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Vision Board Controller
 * Handles HTTP requests for vision goals
 */
class VisionBoardController {
  /**
   * Get all vision goals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getGoals(req, res) {
    try {
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } = visionSchemas.getGoals.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await VisionBoardService.getGoals(value);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Vision goals retrieved successfully",
        200,
        {
          pagination: result.pagination,
          statistics: result.statistics,
        }
      );
    } catch (error) {
      logger.error("Error in getGoals:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new vision goal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createGoal(req, res) {
    try {
      const data = req.body;

      // Validate request body
      const { error, value } = visionSchemas.createGoal.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const goal = await VisionBoardService.createGoal(value);

      return ResponseUtils.sendSuccess(
        res,
        goal,
        "Vision goal created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createGoal:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a vision goal by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getGoalById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      const goal = await VisionBoardService.getGoalById(id);

      return ResponseUtils.sendSuccess(
        res,
        goal,
        "Vision goal retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGoalById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a vision goal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateGoal(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      // Validate request body
      const { error, value } = visionSchemas.updateGoal.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const goal = await VisionBoardService.updateGoal(id, value);

      return ResponseUtils.sendSuccess(
        res,
        goal,
        "Vision goal updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateGoal:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a vision goal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteGoal(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      await VisionBoardService.deleteGoal(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Vision goal deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteGoal:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Link a project to a vision goal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async linkProjectToVision(req, res) {
    try {
      const { id } = req.params;
      const { project_id } = req.body;

      // Validate UUIDs
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      if (!ValidationUtils.validateUUID(project_id)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      // Validate request body
      const { error, value } = visionSchemas.linkProject.validate({
        project_id,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await VisionBoardService.linkProjectToVision(
        id,
        value.project_id
      );

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Project linked to vision goal successfully"
      );
    } catch (error) {
      logger.error("Error in linkProjectToVision:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Unlink a project from a vision goal
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async unlinkProjectFromVision(req, res) {
    try {
      const { id, projectId } = req.params;

      // Validate UUIDs
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      const goal = await VisionBoardService.unlinkProjectFromVision(
        id,
        projectId
      );

      return ResponseUtils.sendSuccess(
        res,
        goal,
        "Project unlinked from vision goal successfully"
      );
    } catch (error) {
      logger.error("Error in unlinkProjectFromVision:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get goal progress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getGoalProgress(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      const progress = await VisionBoardService.getGoalProgress(id);

      return ResponseUtils.sendSuccess(
        res,
        progress,
        "Goal progress retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getGoalProgress:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get available projects for linking
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getAvailableProjects(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid vision goal ID", 400);
      }

      const projects = await VisionBoardService.getAvailableProjects(id);

      return ResponseUtils.sendSuccess(
        res,
        projects,
        "Available projects retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getAvailableProjects:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get vision goal categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getCategories(req, res) {
    try {
      const categories = await VisionBoardService.getCategories();

      return ResponseUtils.sendSuccess(
        res,
        categories,
        "Categories retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategories:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get goal statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getStatistics(req, res) {
    try {
      const statistics = await VisionBoardService.getStatistics();

      return ResponseUtils.sendSuccess(
        res,
        statistics,
        "Statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getStatistics:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get goal options for UI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getOptions(req, res) {
    try {
      const options = VisionUtils.getGoalOptions();

      return ResponseUtils.sendSuccess(
        res,
        options,
        "Options retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getOptions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Export vision goals
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async exportGoals(req, res) {
    try {
      const { format = "json" } = req.query;

      const result = await VisionBoardService.getGoals({ limit: 1000 });
      const goals = result.data;

      if (format === "csv") {
        const csvData = goals.map((g) => ({
          Goal: g.goal,
          Status: g.status,
          Priority: g.priority,
          Category: g.category || "General",
          Progress: `${g.progress}%`,
          "Project Count": g.project_count,
          Timeline: g.target_timeline || "Not specified",
          "Created At": new Date(g.created_at).toLocaleDateString(),
        }));

        return ResponseUtils.sendSuccess(
          res,
          csvData,
          "Vision goals exported successfully",
          200,
          { format: "csv" }
        );
      }

      // Return formatted goals
      const formattedGoals = goals.map((g) => ({
        ...g,
        formatted: VisionUtils.formatVisionGoal(g),
      }));

      return ResponseUtils.sendSuccess(
        res,
        formattedGoals,
        "Vision goals exported successfully"
      );
    } catch (error) {
      logger.error("Error in exportGoals:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new VisionBoardController();
