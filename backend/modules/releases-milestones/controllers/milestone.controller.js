const MilestoneService = require("../services/milestone.service");
const MilestoneUtils = require("../utils/milestone.utils");
const {
  milestoneSchemas,
} = require("../validations/releases-milestones.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Milestone Controller
 * Handles HTTP requests for milestones
 */
class MilestoneController {
  /**
   * Get all milestones for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getMilestones(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } =
        milestoneSchemas.getMilestones.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await MilestoneService.getProjectMilestones(
        projectId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Milestones retrieved successfully",
        200,
        {
          pagination: result.pagination,
          statistics: await MilestoneService.getMilestoneStatistics(projectId),
        }
      );
    } catch (error) {
      logger.error("Error in getMilestones:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createMilestone(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = milestoneSchemas.createMilestone.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const milestone = await MilestoneService.createMilestone(
        projectId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        milestone,
        "Milestone created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createMilestone:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a milestone by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getMilestoneById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid milestone ID", 400);
      }

      const milestone = await MilestoneService.getMilestoneById(id);

      return ResponseUtils.sendSuccess(
        res,
        milestone,
        "Milestone retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMilestoneById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateMilestone(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid milestone ID", 400);
      }

      // Validate request body
      const { error, value } = milestoneSchemas.updateMilestone.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const milestone = await MilestoneService.updateMilestone(id, value);

      return ResponseUtils.sendSuccess(
        res,
        milestone,
        "Milestone updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateMilestone:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Update milestone status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateMilestoneStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid milestone ID", 400);
      }

      // Validate status
      const { error, value } = milestoneSchemas.updateMilestoneStatus.validate({
        status,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const milestone = await MilestoneService.updateMilestoneStatus(
        id,
        value.status
      );

      return ResponseUtils.sendSuccess(
        res,
        milestone,
        "Milestone status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateMilestoneStatus:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteMilestone(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid milestone ID", 400);
      }

      await MilestoneService.deleteMilestone(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Milestone deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteMilestone:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get milestone progress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getMilestoneProgress(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid milestone ID", 400);
      }

      const progress = await MilestoneService.calculateMilestoneProgress(id);

      return ResponseUtils.sendSuccess(
        res,
        progress,
        "Milestone progress retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMilestoneProgress:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get overdue milestones
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getOverdueMilestones(req, res) {
    try {
      const { projectId } = req.params;

      const milestones = await MilestoneService.getOverdueMilestones(projectId);

      return ResponseUtils.sendSuccess(
        res,
        milestones,
        "Overdue milestones retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getOverdueMilestones:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get milestone statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getMilestoneStatistics(req, res) {
    try {
      const { projectId } = req.params;

      const statistics = await MilestoneService.getMilestoneStatistics(
        projectId
      );

      return ResponseUtils.sendSuccess(
        res,
        statistics,
        "Milestone statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMilestoneStatistics:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Bulk update milestone progress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async bulkUpdateProgress(req, res) {
    try {
      const { projectId } = req.params;
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        return ResponseUtils.sendError(res, "Updates array is required", 400);
      }

      const milestones = await MilestoneService.bulkUpdateProgress(
        projectId,
        updates
      );

      return ResponseUtils.sendSuccess(
        res,
        milestones,
        "Milestone progress updated successfully"
      );
    } catch (error) {
      logger.error("Error in bulkUpdateProgress:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }
}

const milestoneController = new MilestoneController();

module.exports = milestoneController;
module.exports.milestoneController = milestoneController;
