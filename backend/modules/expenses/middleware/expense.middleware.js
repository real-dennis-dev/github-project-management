const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

/**
 * Expense Middleware
 * Provides middleware functions for expense routes
 */
class ExpenseMiddleware {
  /**
   * Validates expense exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateExpenseExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid expense ID", 400);
      }

      const { data, error } = await supabase
        .from("expenses")
        .select("id, project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Expense not found", 404);
      }

      req.expense = data;
      next();
    } catch (error) {
      logger.error("Error in validateExpenseExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates expense belongs to project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateExpenseBelongsToProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const { id } = req.params;

      // If we have expense from previous middleware, check it
      if (req.expense) {
        if (req.expense.project_id !== projectId) {
          return ResponseUtils.sendError(
            res,
            "Expense does not belong to this project",
            403
          );
        }
        return next();
      }

      // Otherwise check database
      const { data, error } = await supabase
        .from("expenses")
        .select("project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Expense not found", 404);
      }

      if (data.project_id !== projectId) {
        return ResponseUtils.sendError(
          res,
          "Expense does not belong to this project",
          403
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateExpenseBelongsToProject:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates user can modify expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkExpenseModificationPermission(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get expense with project info
      const { data, error } = await supabase
        .from("expenses")
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
        return ResponseUtils.sendError(res, "Expense not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this expense"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkExpenseModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes expense data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeExpenseData(req, res, next) {
    try {
      const data = req.body;

      if (data.description) {
        data.description = data.description.trim().replace(/<[^>]*>/g, "");
      }

      if (data.vendor) {
        data.vendor = data.vendor.trim().replace(/<[^>]*>/g, "");
      }

      if (data.receipt_url) {
        data.receipt_url = data.receipt_url.trim();
      }

      if (data.amount) {
        data.amount = parseFloat(data.amount);
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeExpenseData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Logs expense activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logExpenseActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Expense Activity", {
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
   * Validates expense amount format
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateExpenseAmount(req, res, next) {
    try {
      const { amount } = req.body;

      if (amount !== undefined) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          return ResponseUtils.sendError(
            res,
            "Amount must be a positive number",
            400
          );
        }
        req.body.amount = numAmount;
      }

      next();
    } catch (error) {
      logger.error("Error in validateExpenseAmount:", error);
      return ResponseUtils.sendError(res, "Invalid amount format", 400);
    }
  }

  /**
   * Validates expense date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateExpenseDate(req, res, next) {
    try {
      const { expense_date } = req.body;

      if (expense_date) {
        const date = new Date(expense_date);
        if (isNaN(date.getTime())) {
          return ResponseUtils.sendError(
            res,
            "Invalid expense date format",
            400
          );
        }

        // Check if date is not in future
        if (date > new Date()) {
          return ResponseUtils.sendError(
            res,
            "Expense date cannot be in the future",
            400
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Error in validateExpenseDate:", error);
      return ResponseUtils.sendError(res, "Invalid date format", 400);
    }
  }
}

module.exports = new ExpenseMiddleware();
