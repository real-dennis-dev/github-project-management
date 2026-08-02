const {
  FeatureSubtaskService,
} = require("../services/feature-subtask.service");
const ResponseUtils = require("../../../common/utils/response.utils");
const { Logger } = require("../../../common/config/logger");

const subtaskService = new FeatureSubtaskService();
const response = ResponseUtils;
const logger = Logger;

class FeatureSubtaskController {
  // controller methods here

  /**
   * GET /api/features/:featureId/subtasks
   * Get subtasks for a feature
   */
  async getSubtasks(req, res, next) {
    try {
      const { featureId } = req.params;
      const filters = {
        is_completed: req.query.is_completed,
        page: req.query.page,
        limit: req.query.limit,
      };

      const result = await subtaskService.getSubtasks(featureId, filters);

      logger.info(
        `Fetched ${result.data.length} subtasks for feature ${featureId}`,
        {
          userId: req.user?.id,
          featureId,
          filters,
        }
      );

      return response.sendSuccess(
        res,
        result.data,
        "Subtasks fetched successfully",
        200,
        {
          pagination: result.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in getSubtasks:", error);
      next(error);
    }
  }

  /**
   * POST /api/features/:featureId/subtasks
   * Create a new subtask
   */
  async createSubtask(req, res, next) {
    try {
      const { featureId } = req.params;
      const subtaskData = req.body;
      const subtask = await subtaskService.createSubtask(
        featureId,
        subtaskData
      );

      logger.info(`Created subtask: ${subtask.id} for feature ${featureId}`, {
        userId: req.user?.id,
        featureId,
        subtaskId: subtask.id,
      });

      return response.sendCreated(res, subtask, "Subtask created successfully");
    } catch (error) {
      logger.error("Error in createSubtask:", error);
      next(error);
    }
  }

  /**
   * PUT /api/subtasks/:id
   * Update subtask by ID
   */
  async updateSubtask(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const subtask = await subtaskService.updateSubtask(id, updateData);

      logger.info(`Updated subtask: ${id}`, {
        userId: req.user?.id,
        subtaskId: id,
        updates: Object.keys(updateData),
      });

      return response.sendSuccess(res, subtask, "Subtask updated successfully");
    } catch (error) {
      logger.error(`Error in updateSubtask for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PATCH /api/subtasks/:id/toggle
   * Toggle subtask completion
   */
  async toggleSubtaskCompletion(req, res, next) {
    try {
      const { id } = req.params;
      const subtask = await subtaskService.toggleSubtaskCompletion(id);

      logger.info(
        `Toggled subtask completion: ${id} -> ${subtask.is_completed}`,
        {
          userId: req.user?.id,
          subtaskId: id,
          isCompleted: subtask.is_completed,
        }
      );

      return response.sendSuccess(res, subtask, "Subtask toggled successfully");
    } catch (error) {
      logger.error(
        `Error in toggleSubtaskCompletion for ${req.params.id}:`,
        error
      );
      next(error);
    }
  }

  /**
   * DELETE /api/subtasks/:id
   * Delete subtask by ID
   */
  async deleteSubtask(req, res, next) {
    try {
      const { id } = req.params;
      const result = await subtaskService.deleteSubtask(id);

      logger.info(`Deleted subtask: ${id}`, {
        userId: req.user?.id,
        subtaskId: id,
      });

      return response.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error(`Error in deleteSubtask for ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = {
  FeatureSubtaskController,
};
