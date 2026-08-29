const RiskService = require("../services/risk.service");
const RiskUtils = require("../utils/risk.utils");
const { riskSchemas } = require("../validations/decisions-risks.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Risk Controller
 * Handles HTTP requests for risks
 */
class RiskController {
  /**
   * Get all risks for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getRisks(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } = riskSchemas.getRisks.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await RiskService.getProjectRisks(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Risks retrieved successfully",
        200,
        {
          pagination: result.pagination,
          summary: RiskUtils.generateRiskSummary(result.data),
        }
      );
    } catch (error) {
      logger.error("Error in getRisks:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new risk
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createRisk(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = riskSchemas.createRisk.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const risk = await RiskService.createRisk(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        risk,
        "Risk created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createRisk:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a risk by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getRiskById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid risk ID", 400);
      }

      const risk = await RiskService.getRiskById(id);

      return ResponseUtils.sendSuccess(
        res,
        risk,
        "Risk retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getRiskById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a risk
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateRisk(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid risk ID", 400);
      }

      // Validate request body
      const { error, value } = riskSchemas.updateRisk.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const risk = await RiskService.updateRisk(id, value);

      return ResponseUtils.sendSuccess(res, risk, "Risk updated successfully");
    } catch (error) {
      logger.error("Error in updateRisk:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Update risk status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateRiskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid risk ID", 400);
      }

      // Validate status
      const { error, value } = riskSchemas.updateRiskStatus.validate({
        status,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const risk = await RiskService.updateRiskStatus(id, value.status);

      return ResponseUtils.sendSuccess(
        res,
        risk,
        "Risk status updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateRiskStatus:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a risk
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteRisk(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid risk ID", 400);
      }

      await RiskService.deleteRisk(id);

      return ResponseUtils.sendSuccess(res, null, "Risk deleted successfully");
    } catch (error) {
      logger.error("Error in deleteRisk:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get risks by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getRisksByStatus(req, res) {
    try {
      const { projectId } = req.params;
      const { status } = req.query;

      if (!status) {
        return ResponseUtils.sendError(
          res,
          "Status parameter is required",
          400
        );
      }

      const risks = await RiskService.getRisksByStatus(projectId, status);

      return ResponseUtils.sendSuccess(
        res,
        risks,
        `Risks with status ${status} retrieved successfully`
      );
    } catch (error) {
      logger.error("Error in getRisksByStatus:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Generate risk report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async generateRiskReport(req, res) {
    try {
      const { projectId } = req.params;

      const report = await RiskService.generateRiskReport(projectId);

      return ResponseUtils.sendSuccess(
        res,
        report,
        "Risk report generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateRiskReport:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get project risk score
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getProjectRiskScore(req, res) {
    try {
      const { projectId } = req.params;

      const score = await RiskService.calculateProjectRiskScore(projectId);

      return ResponseUtils.sendSuccess(
        res,
        score,
        "Project risk score calculated successfully"
      );
    } catch (error) {
      logger.error("Error in getProjectRiskScore:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get risk matrix data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getRiskMatrix(req, res) {
    try {
      const { projectId } = req.params;

      const { data: risks } = await RiskService.getProjectRisks(projectId, {
        limit: 1000,
      });
      const matrix = RiskUtils.generateRiskMatrix(risks || []);

      return ResponseUtils.sendSuccess(
        res,
        matrix,
        "Risk matrix generated successfully"
      );
    } catch (error) {
      logger.error("Error in getRiskMatrix:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

const riskController = new RiskController();

module.exports = riskController;
module.exports.riskController = riskController;
