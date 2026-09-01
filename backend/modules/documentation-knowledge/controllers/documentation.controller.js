const documentationService = require("../services/documentation.service");
const responseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");
const documentationSchemas = require("../validations/documentation.schema");
const documentationKnowledgeStatsService = require("../services/documentation-knowledge-stats.service.js");

class DocumentationController {
  /**
   * Get project documentation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDocumentation(req, res) {
    try {
      const { projectId } = req.params;
      const { type, limit, offset, sortBy, sortOrder } = req.query;

      const pagination = { limit, offset, sortBy, sortOrder };
      const result = await documentationService.getProjectDocumentation(
        projectId,
        type,
        pagination
      );

      return responseUtils.sendSuccess(
        res,
        result.data,
        "Documentation retrieved successfully",
        200,
        {
          pagination: result.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in getDocumentation:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create documentation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createDocumentation(req, res) {
    try {
      const { projectId } = req.params;

      // Validate request body
      const { error } = documentationSchemas.createDocumentation.validate(
        req.body
      );
      if (error) {
        return responseUtils.sendValidationError(res, error.details);
      }

      const doc = await documentationService.createDocumentation(
        projectId,
        req.body
      );
      return responseUtils.sendCreated(
        res,
        doc,
        "Documentation created successfully"
      );
    } catch (error) {
      logger.error("Error in createDocumentation:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get documentation by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDocumentationById(req, res) {
    try {
      const { id } = req.params;
      const doc = await documentationService.getDocumentationById(id);
      return responseUtils.sendSuccess(
        res,
        doc,
        "Documentation retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDocumentationById:", error);
      return responseUtils.sendError(
        res,
        error.message,
        error.message === "Documentation not found" ? 404 : 500
      );
    }
  }

  /**
   * Update documentation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateDocumentation(req, res) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error } = documentationSchemas.updateDocumentation.validate(
        req.body
      );
      if (error) {
        return responseUtils.sendValidationError(res, error.details);
      }

      const doc = await documentationService.updateDocumentation(id, req.body);
      return responseUtils.sendSuccess(
        res,
        doc,
        "Documentation updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateDocumentation:", error);
      return responseUtils.sendError(
        res,
        error.message,
        error.message === "Documentation not found" ? 404 : 500
      );
    }
  }

  /**
   * Delete documentation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteDocumentation(req, res) {
    try {
      const { id } = req.params;
      await documentationService.deleteDocumentation(id);
      return responseUtils.sendNoContent(res);
    } catch (error) {
      logger.error("Error in deleteDocumentation:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Search documentation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchDocumentation(req, res) {
    try {
      const { projectId } = req.params;
      const { query, doc_type, limit, offset } = req.query;

      // Validate query parameters
      const { error } = documentationSchemas.searchDocumentation.validate({
        query,
        doc_type,
        limit,
        offset,
      });
      if (error) {
        return responseUtils.sendValidationError(res, error.details);
      }

      const results = await documentationService.searchDocumentation(
        projectId,
        query,
        { doc_type, limit, offset }
      );

      return responseUtils.sendSuccess(
        res,
        results.data,
        "Search completed successfully",
        200,
        {
          pagination: results.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in searchDocumentation:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }
  /**
   * Dashboard: aggregated stats + combined latest items (no projectId)
   */
  async getDocumentationKnowledgeStats(req, res) {
    try {
      const { limit, offset, sortBy, sortOrder } = req.query;

      // Validation is done by middleware / schema
      const result = await documentationKnowledgeStatsService.getStats({
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
        sortBy,
        sortOrder,
      });

      return responseUtils.sendSuccess(
        res,
        {
          stats: result.stats,
          items: result.items, // clickable list for the dashboard
        },
        "Documentation & Knowledge stats retrieved successfully",
        200,
        { pagination: result.pagination }
      );
    } catch (error) {
      logger.error("Error in getDocumentationKnowledgeStats:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }
}

const documentationController = new DocumentationController();

module.exports = documentationController;
module.exports.documentationController = documentationController;
