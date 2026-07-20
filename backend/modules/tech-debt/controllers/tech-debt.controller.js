const TechDebtService = require("../services/tech-debt.service");
const TechDebtUtils = require("../utils/tech-debt.utils");
const { techDebtSchemas } = require("../validations/tech-debt.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Tech Debt Controller
 * Handles HTTP requests for tech debt management
 */
class TechDebtController {
  /**
   * Get all tech debt items for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTechDebt(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } =
        techDebtSchemas.getTechDebt.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await TechDebtService.getProjectTechDebt(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Tech debt items retrieved successfully",
        200,
        {
          pagination: result.pagination,
          metrics: result.metrics,
        }
      );
    } catch (error) {
      logger.error("Error in getTechDebt:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new tech debt item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createTechDebt(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = techDebtSchemas.createTechDebt.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const techDebt = await TechDebtService.createTechDebt(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        techDebt,
        "Tech debt item created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createTechDebt:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a tech debt item by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTechDebtById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid tech debt ID", 400);
      }

      const techDebt = await TechDebtService.getTechDebtById(id);

      return ResponseUtils.sendSuccess(
        res,
        techDebt,
        "Tech debt item retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTechDebtById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a tech debt item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateTechDebt(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid tech debt ID", 400);
      }

      // Validate request body
      const { error, value } = techDebtSchemas.updateTechDebt.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const techDebt = await TechDebtService.updateTechDebt(id, value);

      return ResponseUtils.sendSuccess(
        res,
        techDebt,
        "Tech debt item updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateTechDebt:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Update tech debt status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateTechDebtStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid tech debt ID", 400);
      }

      // Validate status
      const { error, value } = techDebtSchemas.updateTechDebtStatus.validate({
        status,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const techDebt = await TechDebtService.updateTechDebtStatus(
        id,
        value.status
      );

      return ResponseUtils.sendSuccess(
        res,
        techDebt,
        "Tech debt status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateTechDebtStatus:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a tech debt item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteTechDebt(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid tech debt ID", 400);
      }

      await TechDebtService.deleteTechDebt(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Tech debt item deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteTechDebt:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get tech debt overview
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTechDebtOverview(req, res) {
    try {
      const { projectId } = req.params;

      const overview = await TechDebtService.getTechDebtOverview(projectId);

      return ResponseUtils.sendSuccess(
        res,
        overview,
        "Tech debt overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTechDebtOverview:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get tech debt score
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTechDebtScore(req, res) {
    try {
      const { projectId } = req.params;

      const score = await TechDebtService.calculateTechDebtScore(projectId);

      return ResponseUtils.sendSuccess(
        res,
        score,
        "Tech debt score calculated successfully"
      );
    } catch (error) {
      logger.error("Error in getTechDebtScore:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get tech debt statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTechDebtStatistics(req, res) {
    try {
      const { projectId } = req.params;

      const statistics = await TechDebtService.getTechDebtStatistics(projectId);

      return ResponseUtils.sendSuccess(
        res,
        statistics,
        "Tech debt statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTechDebtStatistics:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Export tech debt items
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async exportTechDebt(req, res) {
    try {
      const { projectId } = req.params;
      const { format = "json" } = req.query;

      const { data: techDebtItems } = await TechDebtService.getProjectTechDebt(
        projectId,
        { limit: 1000 }
      );

      const formattedItems = techDebtItems.map((item) =>
        TechDebtUtils.formatForExport(item)
      );

      if (format === "csv") {
        // Format for CSV export
        const csvData = formattedItems.map((d) => ({
          Title: d.title,
          Description: d.description,
          Reason: d.reason,
          Priority: d.priority,
          Status: d.status,
          "Impact Score": d.impactScore,
          "Impact Level": d.impactLevel,
          "Estimated Hours": d.estimatedEffortHours,
          "Created At": d.created_at,
        }));

        return ResponseUtils.sendSuccess(
          res,
          csvData,
          "Tech debt exported successfully",
          200,
          { format: "csv" }
        );
      }

      return ResponseUtils.sendSuccess(
        res,
        {
          items: formattedItems,
          total: formattedItems.length,
          exportedAt: new Date().toISOString(),
        },
        "Tech debt exported successfully"
      );
    } catch (error) {
      logger.error("Error in exportTechDebt:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get refactoring suggestions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getRefactoringSuggestions(req, res) {
    try {
      const { projectId } = req.params;

      const { data: techDebtItems } = await TechDebtService.getProjectTechDebt(
        projectId,
        { limit: 100 }
      );

      const suggestions = techDebtItems.map((item) => ({
        id: item.id,
        title: item.title,
        suggestion: TechDebtUtils.suggestRefactoringPriority(item),
        effort: item.estimated_effort_hours,
      }));

      return ResponseUtils.sendSuccess(
        res,
        suggestions,
        "Refactoring suggestions retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getRefactoringSuggestions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new TechDebtController();
