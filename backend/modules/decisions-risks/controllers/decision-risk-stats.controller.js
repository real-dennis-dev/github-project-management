const DecisionRiskStatsService = require("../services/decision-risk-stats.service");
const {
  decisionRiskStatsSchema,
} = require("../validations/decisions-risks.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

class DecisionRiskStatsController {
  /**
   * Get dashboard statistics for decisions and risks
   * across all projects.
   *
   * GET /api/decisions-risks/stats
   */
  async getDecisionRiskStats(req, res) {
    try {
      // Validate query parameters
      const { error, value } = decisionRiskStatsSchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const stats = await DecisionRiskStatsService.getDecisionRiskStats(value);

      return ResponseUtils.sendSuccess(
        res,
        stats,
        "Decision and risk statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDecisionRiskStats:", error);

      return ResponseUtils.sendError(
        res,
        error.message || "Failed to retrieve decision and risk statistics",
        500
      );
    }
  }
}

module.exports = new DecisionRiskStatsController();
