const JournalService = require("../services/journal.service");
const JournalUtils = require("../utils/journal.utils");
const { journalSchemas } = require("../validations/journal.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * Journal Controller
 * Handles HTTP requests for journal entries
 */
class JournalController {
  /**
   * Get all journal entries for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getJournalEntries(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } =
        journalSchemas.getJournalEntries.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await JournalService.getJournalEntries(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Journal entries retrieved successfully",
        200,
        {
          pagination: result.pagination,
          filters: {
            fromDate: value.fromDate || null,
            toDate: value.toDate || null,
            mood: value.mood || null,
          },
        }
      );
    } catch (error) {
      logger.error("Error in getJournalEntries:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new journal entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createJournalEntry(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = journalSchemas.createJournalEntry.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const entry = await JournalService.createJournalEntry(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        entry,
        "Journal entry created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createJournalEntry:", error);

      // Check for duplicate entry error
      if (error.message.includes("already exists")) {
        return ResponseUtils.sendError(res, error.message, 409);
      }

      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get a journal entry by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getJournalEntryById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid journal entry ID", 400);
      }

      const entry = await JournalService.getJournalEntryById(id);

      return ResponseUtils.sendSuccess(
        res,
        entry,
        "Journal entry retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getJournalEntryById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update a journal entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateJournalEntry(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid journal entry ID", 400);
      }

      // Validate request body
      const { error, value } = journalSchemas.updateJournalEntry.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const entry = await JournalService.updateJournalEntry(id, value);

      return ResponseUtils.sendSuccess(
        res,
        entry,
        "Journal entry updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateJournalEntry:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete a journal entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteJournalEntry(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid journal entry ID", 400);
      }

      await JournalService.deleteJournalEntry(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Journal entry deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteJournalEntry:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get journal entry by date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getJournalByDate(req, res) {
    try {
      const { projectId, date } = req.params;

      // Validate date
      const { error, value } = journalSchemas.getJournalByDate.validate({
        date,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const entry = await JournalService.getJournalByDate(projectId, date);

      if (!entry) {
        return ResponseUtils.sendError(
          res,
          `No journal entry found for ${date}`,
          404
        );
      }

      return ResponseUtils.sendSuccess(
        res,
        entry,
        "Journal entry retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getJournalByDate:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get journal statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getJournalStats(req, res) {
    try {
      const { projectId } = req.params;

      const stats = await JournalService.getJournalStats(projectId);

      return ResponseUtils.sendSuccess(
        res,
        stats,
        "Journal statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getJournalStats:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get today's journal entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTodayEntry(req, res) {
    try {
      const { projectId } = req.params;

      const entry = await JournalService.getOrCreateTodayEntry(projectId);

      return ResponseUtils.sendSuccess(
        res,
        entry,
        "Today's journal entry retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getTodayEntry:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get journal entries by month
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getJournalByMonth(req, res) {
    try {
      const { projectId } = req.params;
      const { year, month } = req.query;

      if (!year || !month) {
        return ResponseUtils.sendError(res, "Year and month are required", 400);
      }

      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return ResponseUtils.sendError(res, "Invalid year or month", 400);
      }

      const entries = await JournalService.getJournalEntriesByMonth(
        projectId,
        yearNum,
        monthNum
      );

      // Get mood trend for the month
      const moodTrend = JournalUtils.calculateMoodTrend(entries);

      return ResponseUtils.sendSuccess(
        res,
        {
          entries,
          summary: {
            total: entries.length,
            moodTrend,
            month: `${yearNum}-${String(monthNum).padStart(2, "0")}`,
          },
        },
        "Journal entries for month retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getJournalByMonth:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Export journal entries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async exportJournal(req, res) {
    try {
      const { projectId } = req.params;
      const { format = "json", fromDate, toDate } = req.query;

      const options = {};
      if (fromDate) options.fromDate = fromDate;
      if (toDate) options.toDate = toDate;

      const result = await JournalService.getJournalEntries(projectId, {
        ...options,
        limit: 1000, // Export all entries
      });

      if (format === "csv") {
        // Format for CSV export
        const csvData = result.data.map((entry) => ({
          Date: JournalUtils.formatJournalDate(entry.entry_date),
          Mood: entry.mood,
          "Finished Today": entry.finished_today || "",
          Problems: entry.problems || "",
          "Tomorrow Plan": entry.tomorrow_plan || "",
          Notes: entry.notes || "",
          Tags: (entry.tags || []).join(", "),
        }));

        return ResponseUtils.sendSuccess(
          res,
          csvData,
          "Journal entries exported successfully",
          200,
          { format: "csv" }
        );
      }

      return ResponseUtils.sendSuccess(
        res,
        {
          entries: result.data,
          total: result.pagination.total,
          exportedAt: new Date().toISOString(),
        },
        "Journal entries exported successfully"
      );
    } catch (error) {
      logger.error("Error in exportJournal:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
  /**
   * Get journal dashboard statistics across all projects.
   *
   * This endpoint intentionally does not accept projectId.
   * The authenticated user's ID determines the projects.
   */
  async getDashboardStats(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      /*
       * Validate query parameters
       */
      const { error, value } = journalSchemas.getDashboardStats.validate(
        req.query
      );

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await JournalService.getDashboardStats(userId, value);

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Journal dashboard statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getDashboardStats:", error);

      return ResponseUtils.sendError(
        res,
        error.message || "Failed to retrieve journal dashboard statistics",
        500
      );
    }
  }
}

const journalController = new JournalController();

module.exports = journalController;
module.exports.journalController = journalController;
