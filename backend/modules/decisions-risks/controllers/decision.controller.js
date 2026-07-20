const DecisionService = require("../services/decision.service");
const DecisionUtils = require("../utils/decision.utils");
const {
  decisionSchemas,
} = require("../validations/decisions-risks.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Decision Controller
 * Handles HTTP requests for decisions
 */
class DecisionController {
  /**
   * Get all decisions for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getDecisions(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } =
        decisionSchemas.getDecisions.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await DecisionService.getProjectDecisions(
        projectId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Decisions retrieved successfully",
        200,
        {
          pagination: result.pagination,
          statistics: await DecisionService.getDecisionStatistics(projectId),
        }
      );
    } catch (error) {
      logger.error("Error in getDecisions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new decision
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createDecision(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = decisionSchemas.createDecision.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const decision = await DecisionService.createDecision(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        decision,
        "Decision created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createDecision:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a decision by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getDecisionById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid decision ID", 400);
      }

      const decision = await DecisionService.getDecisionById(id);

      return ResponseUtils.sendSuccess(
        res,
        decision,
        "Decision retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDecisionById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a decision
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateDecision(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid decision ID", 400);
      }

      // Validate request body
      const { error, value } = decisionSchemas.updateDecision.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const decision = await DecisionService.updateDecision(id, value);

      return ResponseUtils.sendSuccess(
        res,
        decision,
        "Decision updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateDecision:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a decision
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteDecision(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid decision ID", 400);
      }

      await DecisionService.deleteDecision(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Decision deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteDecision:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Export decisions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response with export data
   */
  async exportDecisions(req, res) {
    try {
      const { projectId } = req.params;
      const { format = "json" } = req.query;

      const report = await DecisionService.generateDecisionReport(projectId);

      if (format === "csv") {
        // Format for CSV export
        const csvData = report.decisions.map((d) => ({
          Title: d.title,
          Description: d.description,
          Decision: d.decision,
          Reason: d.reason,
          Impact: d.impact.toUpperCase(),
          Alternatives: d.alternatives,
          Date: d.decision_date,
        }));

        return ResponseUtils.sendSuccess(
          res,
          csvData,
          "Decisions exported successfully",
          200,
          { format: "csv" }
        );
      }

      return ResponseUtils.sendSuccess(
        res,
        report,
        "Decision report generated successfully"
      );
    } catch (error) {
      logger.error("Error in exportDecisions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get decision statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getDecisionStatistics(req, res) {
    try {
      const { projectId } = req.params;

      const statistics = await DecisionService.getDecisionStatistics(projectId);

      return ResponseUtils.sendSuccess(
        res,
        statistics,
        "Decision statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDecisionStatistics:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new DecisionController();
