const ExpenseService = require("../services/expense.service");
const ExpenseDashboardService = require("../services/dashboard.service");
const ExpenseUtils = require("../utils/expense.utils");
const { expenseSchemas } = require("../validations/expense.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const DateUtils = require("../../../common/utils/date.utils");
const logger = require("../../../common/config/logger");

/**
 * Expense Controller
 * Handles HTTP requests for expenses
 */
class ExpenseController {
  /**
   * Get all expenses for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getExpenses(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;

      // Validate query parameters
      const { error, value } = expenseSchemas.getExpenses.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await ExpenseService.getProjectExpenses(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        result.data,
        "Expenses retrieved successfully",
        200,
        {
          pagination: result.pagination,
          statistics: result.statistics,
        }
      );
    } catch (error) {
      logger.error("Error in getExpenses:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Create a new expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async createExpense(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;

      // Validate request body
      const { error, value } = expenseSchemas.createExpense.validate({
        ...data,
        project_id: projectId,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const expense = await ExpenseService.createExpense(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        expense,
        "Expense created successfully",
        201
      );
    } catch (error) {
      logger.error("Error in createExpense:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get an expense by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getExpenseById(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid expense ID", 400);
      }

      const expense = await ExpenseService.getExpenseById(id);

      return ResponseUtils.sendSuccess(
        res,
        expense,
        "Expense retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getExpenseById:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Update an expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid expense ID", 400);
      }

      // Validate request body
      const { error, value } = expenseSchemas.updateExpense.validate(data);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const expense = await ExpenseService.updateExpense(id, value);

      return ResponseUtils.sendSuccess(
        res,
        expense,
        "Expense updated successfully"
      );
    } catch (error) {
      logger.error("Error in updateExpense:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Delete an expense
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async deleteExpense(req, res) {
    try {
      const { id } = req.params;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid expense ID", 400);
      }

      await ExpenseService.deleteExpense(id);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Expense deleted successfully"
      );
    } catch (error) {
      logger.error("Error in deleteExpense:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Get expense summary
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getExpenseSummary(req, res) {
    try {
      const { projectId } = req.params;
      const { year } = req.query;

      const summary = await ExpenseService.getExpenseSummary(projectId, {
        year: year ? parseInt(year) : new Date().getFullYear(),
      });

      return ResponseUtils.sendSuccess(
        res,
        summary,
        "Expense summary retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getExpenseSummary:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get expenses by category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getExpensesByCategory(req, res) {
    try {
      const { projectId } = req.params;
      const { fromDate, toDate } = req.query;

      const categories = await ExpenseService.getExpensesByCategory(projectId, {
        fromDate,
        toDate,
      });

      return ResponseUtils.sendSuccess(
        res,
        categories,
        "Expenses by category retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getExpensesByCategory:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get total expenses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getTotalExpenses(req, res) {
    try {
      const { projectId } = req.params;
      const { fromDate, toDate } = req.query;

      const total = await ExpenseService.calculateTotalExpenses(projectId, {
        fromDate,
        toDate,
      });

      return ResponseUtils.sendSuccess(
        res,
        total,
        "Total expenses calculated successfully"
      );
    } catch (error) {
      logger.error("Error in getTotalExpenses:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get monthly expenses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getMonthlyExpenses(req, res) {
    try {
      const { projectId } = req.params;
      const { year } = req.query;

      // Validate query
      const { error, value } = expenseSchemas.getMonthlyExpenses.validate({
        year,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const monthly = await ExpenseService.getMonthlyExpenses(projectId, value);

      return ResponseUtils.sendSuccess(
        res,
        monthly,
        "Monthly expenses retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getMonthlyExpenses:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Export expenses
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async exportExpenses(req, res) {
    try {
      const { projectId } = req.params;
      const { format = "json", fromDate, toDate } = req.query;

      // Get expenses
      const result = await ExpenseService.getProjectExpenses(projectId, {
        fromDate,
        toDate,
        limit: 1000, // Max for export
      });

      const expenses = result.data;

      if (format === "csv") {
        const csvData = ExpenseUtils.formatExpensesForExport(expenses);
        return ResponseUtils.sendSuccess(
          res,
          csvData,
          "Expenses exported successfully",
          200,
          { format: "csv", count: csvData.length }
        );
      }

      // Default JSON format
      const report = ExpenseUtils.generateExpenseReport(expenses);
      return ResponseUtils.sendSuccess(
        res,
        {
          expenses,
          report,
        },
        "Expenses exported successfully",
        200,
        { format: "json", count: expenses.length }
      );
    } catch (error) {
      logger.error("Error in exportExpenses:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get expense statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getExpenseStatistics(req, res) {
    try {
      const { projectId } = req.params;

      const summary = await ExpenseService.getExpenseSummary(projectId);
      const categories = await ExpenseService.getExpensesByCategory(projectId);

      return ResponseUtils.sendSuccess(
        res,
        {
          summary,
          categories,
          categoryOptions: ExpenseUtils.getCategoryOptions(),
        },
        "Expense statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getExpenseStatistics:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
  /**
   * Get expenses dashboard across all projects
   *
   * This endpoint intentionally does not accept projectId.
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<Object>} Dashboard response
   */
  async getExpenseDashboard(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      /*
       * Validate dashboard query parameters.
       */
      const { error, value } = expenseSchemas.getExpenseDashboard.validate(
        req.query,
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      /*
       * Get dashboard data.
       *
       * Notice:
       * No projectId is passed.
       */
      const dashboard = await ExpenseService.getExpenseDashboard(userId, value);

      return ResponseUtils.sendSuccess(
        res,
        dashboard,
        "Expense dashboard retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Error in getExpenseDashboard:", error);

      return ResponseUtils.sendError(
        res,
        error.message || "Failed to retrieve expense dashboard",
        500
      );
    }
  }
}

const expenseController = new ExpenseController();

module.exports = expenseController;
module.exports.expenseController = expenseController;
