const { supabase } = require("../../../common/config/supabase");
const ExpenseUtils = require("../utils/expense.utils");
const DateUtils = require("../../../common/utils/date.utils");
const logger = require("../../../common/config/logger");

/**
 * Expense Service
 * Handles business logic for expenses
 */
class ExpenseDashboardService {
  /**
   * Gets the complete expenses dashboard across all projects
   * available to the authenticated user.
   *
   * IMPORTANT:
   * This method does NOT accept a projectId.
   *
   * @param {string} userId - Authenticated user UUID
   * @param {Object} options - Dashboard filters
   * @returns {Promise<Object>} Dashboard data
   */
  async getExpenseDashboard(userId, options = {}) {
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
      } = options;

      /*
       * --------------------------------------------
       * STEP 1: Get expenses belonging to the user's
       * projects.
       *
       * We use projects!inner so expenses without an
       * accessible project are not returned.
       *
       * This example assumes project ownership is
       * represented by projects.owner_id.
       *
       * If your application uses project_members instead,
       * replace this access condition with your membership
       * logic / RLS policy.
       * --------------------------------------------
       */

      let baseQuery = supabase
        .from("expenses")
        .select(
          `
        id,
        project_id,
        description,
        amount,
        category,
        expense_date,
        vendor,
        receipt_url,
        recurring,
        created_at,
        updated_at,
        projects!inner (
          id,
          name,
          owner_id
        )
      `,
          {
            count: "exact",
          }
        )
        .eq("projects.owner_id", userId);

      // --------------------------------------------
      // APPLY FILTERS
      // --------------------------------------------

      if (category) {
        baseQuery = baseQuery.eq("category", category);
      }

      if (fromDate) {
        baseQuery = baseQuery.gte("expense_date", fromDate);
      }

      if (toDate) {
        baseQuery = baseQuery.lte("expense_date", toDate);
      }

      if (minAmount) {
        baseQuery = baseQuery.gte("amount", minAmount);
      }

      if (maxAmount) {
        baseQuery = baseQuery.lte("amount", maxAmount);
      }

      if (vendor) {
        baseQuery = baseQuery.ilike("vendor", `%${vendor}%`);
      }

      if (recurring !== undefined) {
        baseQuery = baseQuery.eq("recurring", recurring);
      }

      /*
       * --------------------------------------------
       * STEP 2:
       * Get the filtered expenses.
       *
       * We need the complete filtered dataset to
       * calculate dashboard-wide statistics.
       * --------------------------------------------
       */

      const { data: expenses, error } = await baseQuery;

      if (error) {
        logger.error("Error fetching expense dashboard data:", error);

        throw new Error("Failed to fetch expense dashboard");
      }

      const allExpenses = expenses || [];

      /*
       * --------------------------------------------
       * STEP 3:
       * BASIC STATISTICS
       * --------------------------------------------
       */

      const amounts = allExpenses.map((expense) => Number(expense.amount) || 0);

      const total = amounts.reduce((sum, amount) => sum + amount, 0);

      const count = allExpenses.length;

      const average = count > 0 ? total / count : 0;

      const max = count > 0 ? Math.max(...amounts) : 0;

      const min = count > 0 ? Math.min(...amounts) : 0;

      const recurringExpenses = allExpenses.filter(
        (expense) => expense.recurring === true
      );

      const recurringTotal = recurringExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );

      /*
       * --------------------------------------------
       * STEP 4:
       * CURRENT MONTH STATISTICS
       * --------------------------------------------
       */

      const now = new Date();

      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const currentMonthExpenses = allExpenses.filter((expense) => {
        const date = new Date(expense.expense_date);

        return (
          date.getFullYear() === currentYear && date.getMonth() === currentMonth
        );
      });

      const currentMonthTotal = currentMonthExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );

      /*
       * --------------------------------------------
       * STEP 5:
       * PREVIOUS MONTH STATISTICS
       * --------------------------------------------
       */

      const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

      const previousYear = previousMonthDate.getFullYear();

      const previousMonth = previousMonthDate.getMonth();

      const previousMonthExpenses = allExpenses.filter((expense) => {
        const date = new Date(expense.expense_date);

        return (
          date.getFullYear() === previousYear &&
          date.getMonth() === previousMonth
        );
      });

      const previousMonthTotal = previousMonthExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );

      /*
       * Percentage change from previous month.
       */

      let monthlyChangePercentage = 0;

      if (previousMonthTotal > 0) {
        monthlyChangePercentage =
          ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      } else if (currentMonthTotal > 0) {
        monthlyChangePercentage = 100;
      }

      /*
       * --------------------------------------------
       * STEP 6:
       * CATEGORY STATISTICS
       * --------------------------------------------
       */

      const categoryMap = {};

      allExpenses.forEach((expense) => {
        const expenseCategory = expense.category || "other";

        if (!categoryMap[expenseCategory]) {
          categoryMap[expenseCategory] = {
            category: expenseCategory,
            category_label:
              ExpenseUtils.getCategoryOptions().find(
                (item) => item.value === expenseCategory
              )?.label || expenseCategory,

            category_icon: ExpenseUtils.getCategoryIcon(expenseCategory),

            category_color: ExpenseUtils.getCategoryColor(expenseCategory),

            total: 0,
            count: 0,
            percentage: 0,
          };
        }

        categoryMap[expenseCategory].total += Number(expense.amount || 0);

        categoryMap[expenseCategory].count += 1;
      });

      const categories = Object.values(categoryMap)
        .map((categoryData) => ({
          ...categoryData,

          percentage: ExpenseUtils.calculateBudgetPercentage(
            categoryData.total,
            total
          ),

          formatted_total: ExpenseUtils.formatCurrency(categoryData.total),
        }))
        .sort((a, b) => b.total - a.total);

      /*
       * --------------------------------------------
       * STEP 7:
       * PROJECT STATISTICS
       * --------------------------------------------
       */

      const projectMap = {};

      allExpenses.forEach((expense) => {
        const projectId = expense.project_id;

        const projectName = expense.projects?.name || "Unknown Project";

        if (!projectMap[projectId]) {
          projectMap[projectId] = {
            project_id: projectId,
            project_name: projectName,
            total: 0,
            count: 0,
            percentage: 0,
          };
        }

        projectMap[projectId].total += Number(expense.amount || 0);

        projectMap[projectId].count += 1;
      });

      const projects = Object.values(projectMap)
        .map((project) => ({
          ...project,

          percentage: ExpenseUtils.calculateBudgetPercentage(
            project.total,
            total
          ),

          formatted_total: ExpenseUtils.formatCurrency(project.total),
        }))
        .sort((a, b) => b.total - a.total);

      /*
       * --------------------------------------------
       * STEP 8:
       * MONTHLY TREND
       * --------------------------------------------
       */

      const monthlyMap = {};

      allExpenses.forEach((expense) => {
        const date = new Date(expense.expense_date);

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            month: key,
            total: 0,
            count: 0,
          };
        }

        monthlyMap[key].total += Number(expense.amount || 0);

        monthlyMap[key].count += 1;
      });

      const monthlyTrend = Object.values(monthlyMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((month) => ({
          ...month,

          average: month.count > 0 ? month.total / month.count : 0,

          formatted_total: ExpenseUtils.formatCurrency(month.total),

          formatted_average: ExpenseUtils.formatCurrency(
            month.count > 0 ? month.total / month.count : 0
          ),
        }));

      /*
       * --------------------------------------------
       * STEP 9:
       * SORT ALL EXPENSES BY LATEST
       *
       * expense_date is the primary ordering.
       * created_at is used as a tie breaker.
       * --------------------------------------------
       */

      const sortedExpenses = [...allExpenses].sort((a, b) => {
        const dateA = new Date(a.expense_date).getTime();

        const dateB = new Date(b.expense_date).getTime();

        if (dateB !== dateA) {
          return dateB - dateA;
        }

        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      /*
       * --------------------------------------------
       * STEP 10:
       * PAGINATE THE LATEST EXPENSES
       * --------------------------------------------
       */

      const offset = (page - 1) * limit;

      const paginatedExpenses = sortedExpenses.slice(offset, offset + limit);

      /*
       * --------------------------------------------
       * STEP 11:
       * FORMAT EXPENSES
       *
       * Include project information because the
       * dashboard contains multiple projects.
       * --------------------------------------------
       */

      const latestExpenses = paginatedExpenses.map((expense) => ({
        ...ExpenseUtils.formatExpenseForDisplay(expense),

        project_id: expense.project_id,

        project_name: expense.projects?.name || "Unknown Project",
      }));

      /*
       * --------------------------------------------
       * STEP 12:
       * TOP EXPENSE
       * --------------------------------------------
       */

      const topExpense =
        count > 0
          ? [...allExpenses].sort(
              (a, b) => Number(b.amount) - Number(a.amount)
            )[0]
          : null;

      /*
       * --------------------------------------------
       * STEP 13:
       * FINAL DASHBOARD RESPONSE
       * --------------------------------------------
       */

      return {
        statistics: {
          total,
          count,
          average,
          max,
          min,

          recurring_count: recurringExpenses.length,

          recurring_total: recurringTotal,

          current_month_total: currentMonthTotal,

          previous_month_total: previousMonthTotal,

          monthly_change_percentage:
            Math.round(monthlyChangePercentage * 100) / 100,

          formatted_total: ExpenseUtils.formatCurrency(total),

          formatted_average: ExpenseUtils.formatCurrency(average),

          formatted_max: ExpenseUtils.formatCurrency(max),

          formatted_min: ExpenseUtils.formatCurrency(min),

          formatted_recurring_total:
            ExpenseUtils.formatCurrency(recurringTotal),

          formatted_current_month_total:
            ExpenseUtils.formatCurrency(currentMonthTotal),

          formatted_previous_month_total:
            ExpenseUtils.formatCurrency(previousMonthTotal),
        },

        categories,

        projects,

        monthlyTrend,

        topExpense: topExpense
          ? {
              ...ExpenseUtils.formatExpenseForDisplay(topExpense),

              project_id: topExpense.project_id,

              project_name: topExpense.projects?.name || "Unknown Project",
            }
          : null,

        latestExpenses,

        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
          hasNextPage: offset + limit < count,
          hasPreviousPage: page > 1,
        },

        filters: {
          category: category || null,
          fromDate: fromDate || null,
          toDate: toDate || null,
          minAmount: minAmount || null,
          maxAmount: maxAmount || null,
          vendor: vendor || null,
          recurring: recurring !== undefined ? recurring : null,
        },

        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("ExpenseService.getExpenseDashboard error:", error);

      throw error;
    }
  }
}
module.exports = new ExpenseDashboardService();
