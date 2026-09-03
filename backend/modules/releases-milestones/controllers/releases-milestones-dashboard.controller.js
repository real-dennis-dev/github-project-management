const DashboardService = require("../services/releases-milestones-dashboard.service");

const {
  milestoneSchemas,
} = require("../validations/releases-milestones.validation");

const ResponseUtils = require("../../../common/utils/response.utils");

const logger = require("../../../common/config/logger");

class ReleasesMilestonesDashboardController {
  /**
   * Get releases and milestones dashboard.
   *
   * This endpoint is GLOBAL.
   *
   * It does NOT accept projectId.
   */
  async getDashboard(req, res) {
    try {
      const queryParams = req.query;

      const { error, value } =
        milestoneSchemas.getReleasesMilestonesDashboard.validate(queryParams);

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const dashboard = await DashboardService.getDashboard(value);

      return ResponseUtils.sendSuccess(
        res,
        dashboard,
        "Releases and milestones dashboard retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Error in getReleasesMilestonesDashboard:", error);

      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

module.exports = new ReleasesMilestonesDashboardController();
