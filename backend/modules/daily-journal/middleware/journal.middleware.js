const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

/**
 * Journal Middleware
 * Provides middleware functions for journal routes
 */
class JournalMiddleware {
  /**
   * Validates journal entry exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateJournalEntryExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid journal entry ID", 400);
      }

      const { data, error } = await supabase
        .from("daily_journal")
        .select("id, project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Journal entry not found", 404);
      }

      req.journalEntry = data;
      next();
    } catch (error) {
      logger.error("Error in validateJournalEntryExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates project has journal entries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateProjectHasJournal(req, res, next) {
    try {
      const { projectId } = req.params;

      const { count, error } = await supabase
        .from("daily_journal")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (error) {
        throw error;
      }

      if (count === 0) {
        return ResponseUtils.sendError(
          res,
          "No journal entries found for this project",
          404
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateProjectHasJournal:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if user can modify journal entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkJournalModificationPermission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get journal entry with project info
      const { data, error } = await supabase
        .from("daily_journal")
        .select(
          `
          id,
          project_id,
          projects (
            owner_id
          )
        `
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Journal entry not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this journal entry"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkJournalModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes journal data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeJournalData(req, res, next) {
    try {
      const data = req.body;

      if (data.finished_today) {
        data.finished_today = data.finished_today
          .trim()
          .replace(/<[^>]*>/g, "");
      }

      if (data.problems) {
        data.problems = data.problems.trim().replace(/<[^>]*>/g, "");
      }

      if (data.tomorrow_plan) {
        data.tomorrow_plan = data.tomorrow_plan.trim().replace(/<[^>]*>/g, "");
      }

      if (data.notes) {
        data.notes = data.notes.trim().replace(/<[^>]*>/g, "");
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeJournalData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Validates date range for journal queries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateJournalDateRange(req, res, next) {
    try {
      const { fromDate, toDate } = req.query;

      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          return ResponseUtils.sendError(res, "Invalid date format", 400);
        }

        if (from > to) {
          return ResponseUtils.sendError(
            res,
            "From date must be before to date",
            400
          );
        }

        // Limit date range to 1 year
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 365) {
          return ResponseUtils.sendError(
            res,
            "Date range cannot exceed 365 days",
            400
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Error in validateJournalDateRange:", error);
      return ResponseUtils.sendError(res, "Invalid date range", 400);
    }
  }

  /**
   * Logs journal activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logJournalActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Journal Activity", {
        action,
        path,
        userId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
      });
    });

    next();
  }

  /**
   * Validates mood in request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateMood(req, res, next) {
    try {
      const { mood } = req.body;

      if (mood) {
        const validMoods = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];
        if (!validMoods.includes(mood)) {
          return ResponseUtils.sendError(
            res,
            "Invalid mood value. Must be one of: 😊, 😐, 😔, 😡, 😴, 🤔, 🎉, 😰",
            400
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Error in validateMood:", error);
      return ResponseUtils.sendError(res, "Invalid mood data", 400);
    }
  }

  /**
   * Caches journal entries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  cacheJournalEntries(req, res, next) {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Check if cache is enabled
    if (process.env.CACHE_ENABLED !== "true") {
      return next();
    }

    // Cache key based on URL and user
    const cacheKey = `journal:${req.user?.id}:${req.originalUrl}`;

    // This would be implemented with Redis
    // For now, just pass through
    next();
  }
}

module.exports = new JournalMiddleware();
