// src/modules/progress-timeline/controllers/progress.controller.js
const ProgressService = require("../services/progress.service");
const { ResponseUtils } = require("../../../common/utils/response.utils");
const { ProgressUtils } = require("../utils/progress.utils");

class ProgressController {
  /**
   * GET /api/projects/:projectId/timeline
   * Get project timeline with filtering
   */
  static async getTimeline(req, res, next) {
    try {
      const { projectId } = req.params;
      const filters = req.query;

      const result = await ProgressService.getProjectTimeline(
        projectId,
        filters
      );

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      // Add computed status to each entry
      const entriesWithStatus = result.data.map((entry) => ({
        ...entry,
        status: ProgressUtils.getProgressStatus(entry.progress_percentage),
        formattedMonth: ProgressUtils.formatMonthYear(entry.month_year),
      }));

      return ResponseUtils.sendPaginated(
        res,
        entriesWithStatus,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/projects/:projectId/timeline
   * Add timeline entry
   */
  static async addTimelineEntry(req, res, next) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      const result = await ProgressService.addTimelineEntry(projectId, data);

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      const responseData = {
        ...result.data,
        status: ProgressUtils.getProgressStatus(
          result.data.progress_percentage
        ),
        formattedMonth: ProgressUtils.formatMonthYear(result.data.month_year),
      };

      return ResponseUtils.sendCreated(
        res,
        responseData,
        result.isUpdate
          ? "Timeline entry updated successfully"
          : "Timeline entry created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/timeline/:id
   * Update timeline entry
   */
  static async updateTimelineEntry(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await ProgressService.updateTimelineEntry(id, data);

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      const responseData = {
        ...result.data,
        status: ProgressUtils.getProgressStatus(
          result.data.progress_percentage
        ),
        formattedMonth: ProgressUtils.formatMonthYear(result.data.month_year),
      };

      return ResponseUtils.sendSuccess(
        res,
        responseData,
        "Timeline entry updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/timeline/:id
   * Delete timeline entry
   */
  static async deleteTimelineEntry(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProgressService.deleteTimelineEntry(id);

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      return ResponseUtils.sendSuccess(
        res,
        { id },
        "Timeline entry deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/projects/:projectId/progress-overview
   * Get progress overview
   */
  static async getProgressOverview(req, res, next) {
    try {
      const { projectId } = req.params;
      const { months } = req.query;

      const result = await ProgressService.getProgressOverview(projectId, {
        months,
      });

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Progress overview retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/projects/:projectId/monthly-progress
   * Get monthly progress (additional endpoint)
   */
  static async getMonthlyProgress(req, res, next) {
    try {
      const { projectId } = req.params;
      const { month, feature_name } = req.query;

      if (!month) {
        return ResponseUtils.sendError(res, "Month parameter is required", 400);
      }

      const result = await ProgressService.calculateMonthlyProgress(
        projectId,
        month,
        { feature_name }
      );

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Monthly progress retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/projects/:projectId/progress-report
   * Generate progress report
   */
  static async generateProgressReport(req, res, next) {
    try {
      const { projectId } = req.params;
      const { months, format } = req.query;

      const result = await ProgressService.generateProgressReport(projectId, {
        months: parseInt(months) || 12,
        format,
      });

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Progress report generated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/projects/:projectId/timeline/bulk
   * Bulk add timeline entries
   */
  static async bulkAddTimelineEntries(req, res, next) {
    try {
      const { projectId } = req.params;
      const { entries } = req.body;

      if (!entries || !Array.isArray(entries) || !entries.length) {
        return ResponseUtils.sendError(res, "Entries array is required", 400);
      }

      const result = await ProgressService.bulkAddTimelineEntries(
        projectId,
        entries
      );

      if (!result.success) {
        return ResponseUtils.sendError(res, result.message, 400);
      }

      const formattedData = result.data.map((entry) => ({
        ...entry,
        status: ProgressUtils.getProgressStatus(entry.progress_percentage),
        formattedMonth: ProgressUtils.formatMonthYear(entry.month_year),
      }));

      return ResponseUtils.sendCreated(
        res,
        {
          entries: formattedData,
          count: result.count,
        },
        result.message
      );
    } catch (error) {
      next(error);
    }
  }
}

const progressController = new ProgressController();

module.exports = ProgressController;
// module.exports.progressController = progressController;
