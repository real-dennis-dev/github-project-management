const { supabase } = require("../../../common/config/supabase");
const ExpenseUtils = require("../utils/expense.utils");
const DateUtils = require("../../../common/utils/date.utils");
const logger = require("../../../common/config/logger");

/**
 * Expense Service
 * Handles business logic for expenses
 */
class ExpenseService {
  /**
   * Gets expenses for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {string} options.category - Filter by category
   * @param {Date} options.fromDate - Filter from date
   * @param {Date} options.toDate - Filter to date
   * @param {number} options.minAmount - Minimum amount
   * @param {number} options.maxAmount - Maximum amount
   * @param {string} options.vendor - Filter by vendor
   * @param {boolean} options.recurring - Filter by recurring
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Expenses with pagination
   */
  async getProjectExpenses(projectId, options = {}) {
    try {
      const {
        category,
        fromDate,
        toDate,
        minAmount,
        maxAmount,
        vendor,
        recurring,
        page = 1,
        limit = 20,
        sortBy = "expense_date",
        sortOrder = "DESC",
      } = options;

      // Build query
      let query = supabase
        .from("expenses")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (category) {
        query = query.eq("category", category);
      }

      if (fromDate) {
        query = query.gte("expense_date", fromDate);
      }

      if (toDate) {
        query = query.lte("expense_date", toDate);
      }

      if (minAmount) {
        query = query.gte("amount", minAmount);
      }

      if (maxAmount) {
        query = query.lte("amount", maxAmount);
      }

      if (vendor) {
        query = query.ilike("vendor", `%${vendor}%`);
      }

      if (recurring !== undefined) {
        query = query.eq("recurring", recurring);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching expenses:", error);
        throw new Error("Failed to fetch expenses");
      }

      // Format expenses for display
      const formattedData = (data || []).map((e) =>
        ExpenseUtils.formatExpenseForDisplay(e)
      );

      return {
        data: formattedData,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        statistics: ExpenseUtils.calculateStatistics(data || []),
      };
    } catch (error) {
      logger.error("ExpenseService.getProjectExpenses error:", error);
      throw error;
    }
  }

  /**
   * Creates a new expense
   * @param {string} projectId - Project UUID
   * @param {Object} data - Expense data
   * @returns {Promise<Object>} - Created expense
   */
  async createExpense(projectId, data) {
    try {
      // Validate data
      const validation = ExpenseUtils.validateExpenseData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare data
      const expenseData = {
        project_id: projectId,
        description: data.description.trim(),
        amount: parseFloat(data.amount),
        category: data.category || "other",
        expense_date:
          data.expense_date || new Date().toISOString().split("T")[0],
        vendor: data.vendor ? data.vendor.trim() : null,
        receipt_url: data.receipt_url || null,
        recurring: data.recurring || false,
      };

      // Insert expense
      const { data: expense, error } = await supabase
        .from("expenses")
        .insert([expenseData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating expense:", error);
        throw new Error("Failed to create expense");
      }

      logger.info(`Expense created: ${expense.id} - ${expense.description}`);
      return ExpenseUtils.formatExpenseForDisplay(expense);
    } catch (error) {
      logger.error("ExpenseService.createExpense error:", error);
      throw error;
    }
  }

  /**
   * Gets an expense by ID
   * @param {string} id - Expense UUID
   * @returns {Promise<Object>} - Expense object
   */
  async getExpenseById(id) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching expense:", error);
        throw new Error("Expense not found");
      }

      return ExpenseUtils.formatExpenseForDisplay(data);
    } catch (error) {
      logger.error("ExpenseService.getExpenseById error:", error);
      throw error;
    }
  }

  /**
   * Updates an expense
   * @param {string} id - Expense UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated expense
   */
  async updateExpense(id, data) {
    try {
      // Check if expense exists
      await this.getExpenseById(id);

      // Prepare update data
      const updateData = {};

      if (data.description) updateData.description = data.description.trim();
      if (data.amount) updateData.amount = parseFloat(data.amount);
      if (data.category) updateData.category = data.category;
      if (data.expense_date) updateData.expense_date = data.expense_date;
      if (data.vendor !== undefined) {
        updateData.vendor = data.vendor ? data.vendor.trim() : null;
      }
      if (data.receipt_url !== undefined) {
        updateData.receipt_url = data.receipt_url || null;
      }
      if (data.recurring !== undefined) updateData.recurring = data.recurring;

      // Update expense
      const { data: expense, error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating expense:", error);
        throw new Error("Failed to update expense");
      }

      logger.info(`Expense updated: ${expense.id} - ${expense.description}`);
      return ExpenseUtils.formatExpenseForDisplay(expense);
    } catch (error) {
      logger.error("ExpenseService.updateExpense error:", error);
      throw error;
    }
  }

  /**
   * Deletes an expense
   * @param {string} id - Expense UUID
   * @returns {Promise<void>}
   */
  async deleteExpense(id) {
    try {
      // Check if expense exists
      await this.getExpenseById(id);

      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting expense:", error);
        throw new Error("Failed to delete expense");
      }

      logger.info(`Expense deleted: ${id}`);
    } catch (error) {
      logger.error("ExpenseService.deleteExpense error:", error);
      throw error;
    }
  }

  /**
   * Gets expense summary for a project
   * @param {string} projectId - Project UUID
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Expense summary
   */
  async getExpenseSummary(projectId, options = {}) {
    try {
      const { year = new Date().getFullYear() } = options;

      // Get all expenses for project
      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        logger.error("Error fetching expenses for summary:", error);
        throw new Error("Failed to fetch expenses");
      }

      if (!expenses || expenses.length === 0) {
        return {
          total: 0,
          average: 0,
          count: 0,
          categories: {},
          monthlyData: [],
          yearlyTotal: 0,
          recurringTotal: 0,
          summary: "No expenses recorded",
        };
      }

      // Calculate basic statistics
      const statistics = ExpenseUtils.calculateStatistics(expenses);
      const report = ExpenseUtils.generateExpenseReport(expenses);

      // Filter by year for yearly data
      const yearExpenses = expenses.filter(
        (e) => new Date(e.expense_date).getFullYear() === year
      );
      const yearlyTotal = yearExpenses.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );
      const recurringExpenses = expenses.filter((e) => e.recurring);
      const recurringTotal = recurringExpenses.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0
      );

      // Monthly breakdown for the year
      const monthlyExpenses = await this.getMonthlyExpenses(projectId, {
        year,
      });

      return {
        ...statistics,
        categories: report.categories,
        monthlyData: monthlyExpenses,
        yearlyTotal,
        recurringTotal,
        recurringCount: recurringExpenses.length,
        summary: report.summary,
        topExpenses: report.topExpenses,
        trends: ExpenseUtils.getExpenseTrend(expenses),
      };
    } catch (error) {
      logger.error("ExpenseService.getExpenseSummary error:", error);
      throw error;
    }
  }

  /**
   * Gets expenses grouped by category
   * @param {string} projectId - Project UUID
   * @param {Object} options - Options
   * @returns {Promise<Array>} - Expenses by category
   */
  async getExpensesByCategory(projectId, options = {}) {
    try {
      const { fromDate, toDate } = options;

      let query = supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId);

      if (fromDate) {
        query = query.gte("expense_date", fromDate);
      }

      if (toDate) {
        query = query.lte("expense_date", toDate);
      }

      const { data: expenses, error } = await query;

      if (error) {
        logger.error("Error fetching expenses by category:", error);
        throw new Error("Failed to fetch expenses");
      }

      if (!expenses || expenses.length === 0) {
        return [];
      }

      // Group by category
      const categories = {};
      expenses.forEach((expense) => {
        const category = expense.category || "other";
        if (!categories[category]) {
          categories[category] = {
            category,
            category_label:
              ExpenseUtils.getCategoryOptions().find(
                (c) => c.value === category
              )?.label || category,
            category_icon: ExpenseUtils.getCategoryIcon(category),
            category_color: ExpenseUtils.getCategoryColor(category),
            total: 0,
            count: 0,
            expenses: [],
            percentage: 0,
          };
        }
        categories[category].total += parseFloat(expense.amount);
        categories[category].count += 1;
        categories[category].expenses.push(
          ExpenseUtils.formatExpenseForDisplay(expense)
        );
      });

      // Calculate total and percentages
      const totalAmount = Object.values(categories).reduce(
        (sum, cat) => sum + cat.total,
        0
      );

      Object.values(categories).forEach((cat) => {
        cat.percentage = ExpenseUtils.calculateBudgetPercentage(
          cat.total,
          totalAmount
        );
        cat.formatted_total = ExpenseUtils.formatCurrency(cat.total);
      });

      // Sort by total descending
      return Object.values(categories).sort((a, b) => b.total - a.total);
    } catch (error) {
      logger.error("ExpenseService.getExpensesByCategory error:", error);
      throw error;
    }
  }

  /**
   * Calculates total expenses for a project
   * @param {string} projectId - Project UUID
   * @param {Object} options - Options
   * @returns {Promise<Object>} - Total expenses
   */
  async calculateTotalExpenses(projectId, options = {}) {
    try {
      const { fromDate, toDate } = options;

      let query = supabase
        .from("expenses")
        .select("amount")
        .eq("project_id", projectId);

      if (fromDate) {
        query = query.gte("expense_date", fromDate);
      }

      if (toDate) {
        query = query.lte("expense_date", toDate);
      }

      const { data: expenses, error } = await query;

      if (error) {
        logger.error("Error calculating total expenses:", error);
        throw new Error("Failed to calculate total expenses");
      }

      if (!expenses || expenses.length === 0) {
        return {
          total: 0,
          count: 0,
          average: 0,
          formatted_total: "$0.00",
          categories: {},
          byCategory: [],
        };
      }

      const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const count = expenses.length;
      const average = total / count;

      // Get category breakdown
      const categoryData = await this.getExpensesByCategory(projectId, {
        fromDate,
        toDate,
      });

      return {
        total,
        count,
        average,
        formatted_total: ExpenseUtils.formatCurrency(total),
        categories: categoryData,
        byCategory: categoryData.map((cat) => ({
          category: cat.category,
          label: cat.category_label,
          total: cat.total,
          formatted_total: cat.formatted_total,
          percentage: cat.percentage,
          count: cat.count,
        })),
      };
    } catch (error) {
      logger.error("ExpenseService.calculateTotalExpenses error:", error);
      throw error;
    }
  }

  /**
   * Gets monthly expenses for a project
   * @param {string} projectId - Project UUID
   * @param {Object} options - Options
   * @returns {Promise<Array>} - Monthly expenses
   */
  async getMonthlyExpenses(projectId, options = {}) {
    try {
      const { year = new Date().getFullYear() } = options;

      // Get all expenses for the year
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .order("expense_date", { ascending: true });

      if (error) {
        logger.error("Error fetching monthly expenses:", error);
        throw new Error("Failed to fetch monthly expenses");
      }

      // Initialize all months
      const monthlyData = [];
      for (let month = 1; month <= 12; month++) {
        monthlyData.push({
          month,
          month_name: new Date(year, month - 1, 1).toLocaleString("default", {
            month: "long",
          }),
          total: 0,
          count: 0,
          expenses: [],
          categories: {},
        });
      }

      // Group expenses by month
      if (expenses && expenses.length > 0) {
        expenses.forEach((expense) => {
          const date = new Date(expense.expense_date);
          const month = date.getMonth(); // 0-indexed

          monthlyData[month].total += parseFloat(expense.amount);
          monthlyData[month].count += 1;
          monthlyData[month].expenses.push(
            ExpenseUtils.formatExpenseForDisplay(expense)
          );

          // Categorize within month
          const category = expense.category || "other";
          if (!monthlyData[month].categories[category]) {
            monthlyData[month].categories[category] = {
              total: 0,
              count: 0,
            };
          }
          monthlyData[month].categories[category].total += parseFloat(
            expense.amount
          );
          monthlyData[month].categories[category].count += 1;
        });
      }

      // Format monthly data
      return monthlyData.map((month) => ({
        ...month,
        formatted_total: ExpenseUtils.formatCurrency(month.total),
        average: month.count > 0 ? month.total / month.count : 0,
        formatted_average: ExpenseUtils.formatCurrency(
          month.count > 0 ? month.total / month.count : 0
        ),
      }));
    } catch (error) {
      logger.error("ExpenseService.getMonthlyExpenses error:", error);
      throw error;
    }
  }

  /**
   * Validates expense data
   * @param {Object} data - Expense data to validate
   * @returns {Object} - Validation result
   */
  validateExpenseData(data) {
    return ExpenseUtils.validateExpenseData(data);
  }
}

module.exports = new ExpenseService();
