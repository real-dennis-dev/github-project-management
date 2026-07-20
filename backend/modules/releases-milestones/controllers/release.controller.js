const ReleaseService = require("../services/release.service");
const ReleaseUtils = require("../utils/release.utils");
const {
  releaseSchemas,
} = require("../validations/releases-milestones.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Release Controller
 * Handles HTTP requests for releases
 */
class ReleaseController {
  /**
   * Get all releases for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getReleases(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } = releaseSchemas.getReleases.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await ReleaseService.getProjectReleases(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Releases retrieved successfully",
        200,
        {
          pagination: result.pagination,
          statistics: await ReleaseService.getReleaseStatistics(projectId),
        }
      );
    } catch (error) {
      logger.error("Error in getReleases:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createRelease(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = releaseSchemas.createRelease.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const release = await ReleaseService.createRelease(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        release,
        "Release created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createRelease:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a release by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getReleaseById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      const release = await ReleaseService.getReleaseById(id);

      return ResponseUtils.sendSuccess(
        res,
        release,
        "Release retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getReleaseById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateRelease(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      // Validate request body
      const { error, value } = releaseSchemas.updateRelease.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const release = await ReleaseService.updateRelease(id, value);

      return ResponseUtils.sendSuccess(
        res,
        release,
        "Release updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateRelease:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Update release status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateReleaseStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      // Validate status
      const { error, value } = releaseSchemas.updateReleaseStatus.validate({
        status,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const release = await ReleaseService.updateReleaseStatus(
        id,
        value.status
      );

      return ResponseUtils.sendSuccess(
        res,
        release,
        "Release status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateReleaseStatus:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteRelease(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      await ReleaseService.deleteRelease(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Release deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteRelease:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Add features to a release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async addFeaturesToRelease(req, res) {
    try {
      const { id } = req.params;
      const { featureIds } = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      // Validate request body
      const { error, value } = releaseSchemas.addFeaturesToRelease.validate({
        featureIds,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const features = await ReleaseService.addFeaturesToRelease(
        id,
        value.featureIds
      );

      return ResponseUtils.sendSuccess(
        res,
        features,
        "Features added to release successfully"
      );
    } catch (error) {
      logger.error("Error in addFeaturesToRelease:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Remove a feature from a release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async removeFeatureFromRelease(req, res) {
    try {
      const { id, featureId } = req.params;

      // Validate UUIDs
      if (
        !ValidationUtils.validateUUID(id) ||
        !ValidationUtils.validateUUID(featureId)
      ) {
        return ResponseUtils.sendError(res, "Invalid ID format", 400);
      }

      await ReleaseService.removeFeatureFromRelease(id, featureId);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Feature removed from release successfully"
      );
    } catch (error) {
      logger.error("Error in removeFeatureFromRelease:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get release progress
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getReleaseProgress(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      const progress = await ReleaseService.calculateReleaseProgress(id);

      return ResponseUtils.sendSuccess(
        res,
        progress,
        "Release progress retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getReleaseProgress:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Generate changelog
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async generateChangelog(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      const changelog = await ReleaseService.generateChangelog(id);

      return ResponseUtils.sendSuccess(
        res,
        { changelog },
        "Changelog generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateChangelog:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get release statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getReleaseStatistics(req, res) {
    try {
      const { projectId } = req.params;

      const statistics = await ReleaseService.getReleaseStatistics(projectId);

      return ResponseUtils.sendSuccess(
        res,
        statistics,
        "Release statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getReleaseStatistics:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new ReleaseController();
