const knowledgeBaseService = require("../services/knowledge-base.service");
const responseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");
const documentationSchemas = require("../validations/documentation.schema");

class KnowledgeBaseController {
  /**
   * Get knowledge entries
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getKnowledgeEntries(req, res) {
    try {
      const { category, tags, limit, offset, sortBy, sortOrder } = req.query;

      const filters = { category, tags: tags ? tags.split(",") : null };
      const pagination = { limit, offset, sortBy, sortOrder };

      const result = await knowledgeBaseService.getKnowledgeEntries(
        filters,
        pagination
      );
      return responseUtils.sendSuccess(
        res,
        result.data,
        "Knowledge entries retrieved successfully",
        200,
        {
          pagination: result.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in getKnowledgeEntries:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create knowledge entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createKnowledgeEntry(req, res) {
    try {
      // Validate request body
      const { error } = documentationSchemas.createKnowledge.validate(req.body);
      if (error) {
        return responseUtils.sendValidationError(res, error.details);
      }

      const entry = await knowledgeBaseService.createKnowledgeEntry(req.body);
      return responseUtils.sendCreated(
        res,
        entry,
        "Knowledge entry created successfully"
      );
    } catch (error) {
      logger.error("Error in createKnowledgeEntry:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get knowledge entry by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getKnowledgeById(req, res) {
    try {
      const { id } = req.params;
      const entry = await knowledgeBaseService.getKnowledgeById(id);
      return responseUtils.sendSuccess(
        res,
        entry,
        "Knowledge entry retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getKnowledgeById:", error);
      return responseUtils.sendError(
        res,
        error.message,
        error.message === "Knowledge entry not found" ? 404 : 500
      );
    }
  }

  /**
   * Update knowledge entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateKnowledgeEntry(req, res) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error } = documentationSchemas.updateKnowledge.validate(req.body);
      if (error) {
        return responseUtils.sendValidationError(res, error.details);
      }

      const entry = await knowledgeBaseService.updateKnowledgeEntry(
        id,
        req.body
      );
      return responseUtils.sendSuccess(
        res,
        entry,
        "Knowledge entry updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateKnowledgeEntry:", error);
      return responseUtils.sendError(
        res,
        error.message,
        error.message === "Knowledge entry not found" ? 404 : 500
      );
    }
  }

  /**
   * Delete knowledge entry
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteKnowledgeEntry(req, res) {
    try {
      const { id } = req.params;
      await knowledgeBaseService.deleteKnowledgeEntry(id);
      return responseUtils.sendNoContent(res);
    } catch (error) {
      logger.error("Error in deleteKnowledgeEntry:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Search knowledge base
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchKnowledge(req, res) {
    try {
      const { query, category, limit, offset } = req.query;

      // Validate query parameters
      const { error } = documentationSchemas.searchKnowledge.validate({
        query,
        category,
        limit,
        offset,
      });
      if (error) {
        return responseUtils.sendValidationError(res, error.details);
      }

      const results = await knowledgeBaseService.searchKnowledge(query, {
        category,
        limit,
        offset,
      });

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
      logger.error("Error in searchKnowledge:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get categories
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCategories(req, res) {
    try {
      const categories = await knowledgeBaseService.getCategories();
      return responseUtils.sendSuccess(
        res,
        categories,
        "Categories retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getCategories:", error);
      return responseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new KnowledgeBaseController();
