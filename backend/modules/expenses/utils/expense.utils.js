const DateUtils = require("../../../common/utils/date.utils");

/**
 * Expense Utilities
 * Handles expense-related helper functions
 */
class ExpenseUtils {
  /**
   * Formats currency amount
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol (default: $)
   * @returns {string} - Formatted currency string
   */
  formatCurrency(amount, currency = "$") {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${currency}0.00`;
    }

    const formatted = amount.toFixed(2);
    return `${currency}${formatted}`;
  }

  /**
   * Calculates percentage of total
   * @param {number} expense - Expense amount
   * @param {number} total - Total amount
   * @returns {number} - Percentage (0-100)
   */
  calculateBudgetPercentage(expense, total) {
    if (!total || total === 0) return 0;
    if (!expense || expense === 0) return 0;

    const percentage = (expense / total) * 100;
    return Math.round(percentage * 100) / 100; // Round to 2 decimals
  }

  /**
   * Validates amount is greater than 0
   * @param {number} amount - Amount to validate
   * @returns {boolean} - True if amount > 0
   */
  validateAmount(amount) {
    return (
      typeof amount === "number" &&
      !isNaN(amount) &&
      amount > 0 &&
      amount < 1000000000
    ); // Max 1 billion
  }

  /**
   * Groups expenses by date
   * @param {Array} expenses - Array of expense objects
   * @param {string} groupBy - Group by 'day', 'month', 'year'
   * @returns {Object} - Grouped expenses
   */
  groupExpensesByDate(expenses, groupBy = "month") {
    if (!expenses || !Array.isArray(expenses)) {
      return {};
    }

    const groups = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.expense_date);
      let key;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        case "year":
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!groups[key]) {
        groups[key] = {
          expenses: [],
          total: 0,
          count: 0,
        };
      }

      groups[key].expenses.push(expense);
      groups[key].total += parseFloat(expense.amount);
      groups[key].count += 1;
    });

    return groups;
  }

  /**
   * Generates expense report
   * @param {Array} expenses - Array of expense objects
   * @param {Object} options - Report options
   * @returns {Object} - Expense report
   */
  generateExpenseReport(expenses, options = {}) {
    if (!expenses || !Array.isArray(expenses)) {
      return {
        totalExpenses: 0,
        averageExpense: 0,
        count: 0,
        categories: {},
        monthlyTrend: [],
        topExpenses: [],
        summary: "No expenses found",
      };
    }

    // Calculate totals
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );
    const count = expenses.length;
    const averageExpense = count > 0 ? totalExpenses / count : 0;

    // Group by category
    const categories = {};
    expenses.forEach((expense) => {
      const category = expense.category || "other";
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          count: 0,
          expenses: [],
        };
      }
      categories[category].total += parseFloat(expense.amount);
      categories[category].count += 1;
      categories[category].expenses.push(expense);
    });

    // Calculate category percentages
    Object.keys(categories).forEach((category) => {
      categories[category].percentage = this.calculateBudgetPercentage(
        categories[category].total,
        totalExpenses
      );
    });

    // Monthly trend
    const monthlyData = this.groupExpensesByDate(expenses, "month");
    const monthlyTrend = Object.keys(monthlyData)
      .sort()
      .map((month) => ({
        month,
        total: monthlyData[month].total,
        count: monthlyData[month].count,
        average: monthlyData[month].total / monthlyData[month].count,
      }));

    // Top expenses
    const topExpenses = [...expenses]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 10)
      .map((e) => ({
        ...e,
        formatted_amount: this.formatCurrency(e.amount),
      }));

    // Generate summary
    const topCategory = Object.entries(categories).sort(
      (a, b) => b[1].total - a[1].total
    )[0];

    const summary =
      count > 0
        ? `Total expenses: ${this.formatCurrency(
            totalExpenses
          )} across ${count} transactions. ` +
          `Average: ${this.formatCurrency(averageExpense)}. ` +
          `Top category: ${
            topCategory
              ? `${topCategory[0]} (${this.formatCurrency(
                  topCategory[1].total
                )})`
              : "None"
          }`
        : "No expenses found";

    return {
      totalExpenses,
      averageExpense,
      count,
      categories,
      monthlyTrend,
      topExpenses,
      summary,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Gets category options for UI dropdown
   * @returns {Array} - Category options
   */
  getCategoryOptions() {
    const categories = [
      { value: "hosting", label: "Hosting", icon: "☁️", color: "#4CAF50" },
      { value: "database", label: "Database", icon: "🗄️", color: "#2196F3" },
      { value: "domain", label: "Domain", icon: "🌐", color: "#FF9800" },
      { value: "api", label: "API Services", icon: "🔌", color: "#9C27B0" },
      { value: "software", label: "Software", icon: "💻", color: "#607D8B" },
      { value: "hardware", label: "Hardware", icon: "🖥️", color: "#795548" },
      { value: "marketing", label: "Marketing", icon: "📢", color: "#E91E63" },
      { value: "other", label: "Other", icon: "📦", color: "#9E9E9E" },
    ];
    return categories;
  }

  /**
   * Gets category color
   * @param {string} category - Category value
   * @returns {string} - Color code
   */
  getCategoryColor(category) {
    const colors = {
      hosting: "#4CAF50",
      database: "#2196F3",
      domain: "#FF9800",
      api: "#9C27B0",
      software: "#607D8B",
      hardware: "#795548",
      marketing: "#E91E63",
      other: "#9E9E9E",
    };
    return colors[category] || "#9E9E9E";
  }

  /**
   * Gets category icon
   * @param {string} category - Category value
   * @returns {string} - Icon
   */
  getCategoryIcon(category) {
    const icons = {
      hosting: "☁️",
      database: "🗄️",
      domain: "🌐",
      api: "🔌",
      software: "💻",
      hardware: "🖥️",
      marketing: "📢",
      other: "📦",
    };
    return icons[category] || "📦";
  }

  /**
   * Validates expense data
   * @param {Object} data - Expense data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateExpenseData(data) {
    const errors = [];

    if (!data.description || data.description.length < 3) {
      errors.push("Description must be at least 3 characters long");
    }

    if (data.amount !== undefined) {
      if (!this.validateAmount(data.amount)) {
        errors.push("Amount must be a positive number greater than 0");
      }
    }

    if (data.expense_date) {
      const date = new Date(data.expense_date);
      if (isNaN(date.getTime())) {
        errors.push("Invalid expense date");
      }
    }

    if (data.receipt_url && !data.receipt_url.match(/^https?:\/\/.+/)) {
      errors.push("Receipt URL must be a valid URL");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formats expense for display
   * @param {Object} expense - Expense object
   * @returns {Object} - Formatted expense
   */
  formatExpenseForDisplay(expense) {
    return {
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount),
      formatted_amount: this.formatCurrency(expense.amount),
      category: expense.category,
      category_label:
        this.getCategoryOptions().find((c) => c.value === expense.category)
          ?.label || expense.category,
      category_icon: this.getCategoryIcon(expense.category),
      category_color: this.getCategoryColor(expense.category),
      expense_date: expense.expense_date,
      formatted_date: new Date(expense.expense_date).toLocaleDateString(),
      vendor: expense.vendor || "N/A",
      receipt_url: expense.receipt_url,
      recurring: expense.recurring,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
    };
  }

  /**
   * Formats expenses for export
   * @param {Array} expenses - Array of expense objects
   * @returns {Array} - Formatted expenses for export
   */
  formatExpensesForExport(expenses) {
    return expenses.map((e) => ({
      Date: new Date(e.expense_date).toLocaleDateString(),
      Description: e.description,
      Amount: e.amount,
      Category: e.category,
      Vendor: e.vendor || "N/A",
      Recurring: e.recurring ? "Yes" : "No",
    }));
  }

  /**
   * Calculates expense statistics
   * @param {Array} expenses - Array of expense objects
   * @returns {Object} - Statistics
   */
  calculateStatistics(expenses) {
    if (!expenses || expenses.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        count: 0,
        recurring: 0,
      };
    }

    const amounts = expenses.map((e) => parseFloat(e.amount));
    const total = amounts.reduce((sum, a) => sum + a, 0);
    const count = amounts.length;
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const average = total / count;
    const recurring = expenses.filter((e) => e.recurring).length;

    return {
      total,
      average,
      max,
      min,
      count,
      recurring,
      formatted_total: this.formatCurrency(total),
      formatted_average: this.formatCurrency(average),
    };
  }

  /**
   * Filters expenses by date range
   * @param {Array} expenses - Array of expense objects
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @returns {Array} - Filtered expenses
   */
  filterByDateRange(expenses, fromDate, toDate) {
    if (!expenses || !Array.isArray(expenses)) {
      return [];
    }

    return expenses.filter((expense) => {
      const date = new Date(expense.expense_date);
      if (fromDate && date < new Date(fromDate)) return false;
      if (toDate && date > new Date(toDate)) return false;
      return true;
    });
  }

  /**
   * Gets expense trends
   * @param {Array} expenses - Array of expense objects
   * @param {number} months - Number of months to trend
   * @returns {Array} - Trend data
   */
  getExpenseTrend(expenses, months = 6) {
    const grouped = this.groupExpensesByDate(expenses, "month");
    const sortedMonths = Object.keys(grouped).sort();

    // Get last N months
    const recentMonths = sortedMonths.slice(-months);

    return recentMonths.map((month) => ({
      month,
      total: grouped[month].total,
      count: grouped[month].count,
      average: grouped[month].total / grouped[month].count,
    }));
  }
}

module.exports = new ExpenseUtils();
