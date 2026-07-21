const FeatureService = require("../services/feature.service");
const ResponseUtils = require("../../../common/utils/response.utils");
const Logger = require("../../../common/config/logger");

const featureService = new FeatureService();
const response = new ResponseUtils();
const logger = Logger;

module.exports = {
  FeatureController,
};

class FeatureController {
  /**
   * GET /api/projects/:projectId/features
   * Get features for a project
   */
  async getFeatures(req, res, next) {
    try {
      const { projectId } = req.params;
      const filters = {
        status: req.query.status,
        difficulty: req.query.difficulty,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const result = await featureService.getProjectFeatures(
        projectId,
        filters
      );

      logger.info(
        `Fetched ${result.data.length} features for project ${projectId}`,
        {
          userId: req.user?.id,
          projectId,
          filters,
        }
      );

      return response.sendSuccess(
        res,
        result.data,
        "Features fetched successfully",
        200,
        {
          pagination: result.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in getFeatures:", error);
      next(error);
    }
  }

  /**
   * POST /api/projects/:projectId/features
   * Create a new feature
   */
  async createFeature(req, res, next) {
    try {
      const { projectId } = req.params;
      const featureData = req.body;
      const feature = await featureService.createFeature(
        projectId,
        featureData
      );

      logger.info(`Created feature: ${feature.id} for project ${projectId}`, {
        userId: req.user?.id,
        projectId,
        featureId: feature.id,
      });

      return response.sendCreated(res, feature, "Feature created successfully");
    } catch (error) {
      logger.error("Error in createFeature:", error);
      next(error);
    }
  }

  /**
   * GET /api/features/:id
   * Get feature by ID
   */
  async getFeatureById(req, res, next) {
    try {
      const { id } = req.params;
      const feature = await featureService.getFeatureById(id);

      logger.info(`Fetched feature: ${id}`, {
        userId: req.user?.id,
        featureId: id,
      });

      return response.sendSuccess(res, feature, "Feature fetched successfully");
    } catch (error) {
      logger.error(`Error in getFeatureById for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PUT /api/features/:id
   * Update feature by ID
   */
  async updateFeature(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const feature = await featureService.updateFeature(id, updateData);

      logger.info(`Updated feature: ${id}`, {
        userId: req.user?.id,
        featureId: id,
        updates: Object.keys(updateData),
      });

      return response.sendSuccess(res, feature, "Feature updated successfully");
    } catch (error) {
      logger.error(`Error in updateFeature for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PATCH /api/features/:id/status
   * Update feature status
   */
  async updateFeatureStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return response.sendValidationError(res, ["Status is required"]);
      }

      const feature = await featureService.updateFeatureStatus(id, status);

      logger.info(`Updated feature status: ${id} -> ${status}`, {
        userId: req.user?.id,
        featureId: id,
        newStatus: status,
      });

      return response.sendSuccess(
        res,
        feature,
        "Feature status updated successfully"
      );
    } catch (error) {
      logger.error(`Error in updateFeatureStatus for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * DELETE /api/features/:id
   * Delete feature by ID
   */
  async deleteFeature(req, res, next) {
    try {
      const { id } = req.params;
      const result = await featureService.deleteFeature(id);

      logger.info(`Deleted feature: ${id}`, {
        userId: req.user?.id,
        featureId: id,
      });

      return response.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error(`Error in deleteFeature for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * POST /api/features/reorder
   * Reorder features
   */
  async reorderFeatures(req, res, next) {
    try {
      const { projectId, orderedIds } = req.body;

      if (!projectId || !orderedIds || !Array.isArray(orderedIds)) {
        return response.sendValidationError(res, [
          "Project ID and ordered IDs are required",
        ]);
      }

      const result = await featureService.reorderFeatures(
        projectId,
        orderedIds
      );

      logger.info(`Reordered features for project ${projectId}`, {
        userId: req.user?.id,
        projectId,
        featureCount: orderedIds.length,
      });

      return response.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error("Error in reorderFeatures:", error);
      next(error);
    }
  }
}
