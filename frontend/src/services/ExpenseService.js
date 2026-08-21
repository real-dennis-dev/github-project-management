// src/components/expense/ExpenseService.js

import axiosInstance from "./axiosInstance";

const API_BASE = "/api";

/**
 * Expense Service - Handles all expense-related API calls
 */
class ExpenseService {
  /**
   * Get all expenses for a project with pagination and filters
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.fromDate - Filter from this date
   * @param {string} params.toDate - Filter up to this date
   * @param {number} params.minAmount - Minimum amount filter
   * @param {number} params.maxAmount - Maximum amount filter
   * @param {string} params.vendor - Filter by vendor (partial match)
   * @param {boolean} params.recurring - Filter by recurring status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise} Expenses list response
   */
  async getExpenses(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new expense
   * @param {string} projectId - Project UUID
   * @param {Object} expenseData - Expense data
   * @param {string} expenseData.description - Description
   * @param {number} expenseData.amount - Amount
   * @param {string} expenseData.category - Category enum
   * @param {string} expenseData.expense_date - Date (YYYY-MM-DD)
   * @param {string} expenseData.vendor - Vendor name
   * @param {string} expenseData.receipt_url - Receipt URL
   * @param {boolean} expenseData.recurring - Is recurring
   * @returns {Promise} Created expense response
   */
  async createExpense(projectId, expenseData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/expenses`,
      expenseData
    );
    return response.data;
  }

  /**
   * Get an expense by ID
   * @param {string} expenseId - Expense UUID
   * @returns {Promise} Expense response
   */
  async getExpenseById(expenseId) {
    const response = await axiosInstance.get(
      `${API_BASE}/expenses/${expenseId}`
    );
    return response.data;
  }

  /**
   * Update an expense
   * @param {string} expenseId - Expense UUID
   * @param {Object} expenseData - Updated expense data
   * @returns {Promise} Updated expense response
   */
  async updateExpense(expenseId, expenseData) {
    const response = await axiosInstance.put(
      `${API_BASE}/expenses/${expenseId}`,
      expenseData
    );
    return response.data;
  }

  /**
   * Delete an expense
   * @param {string} expenseId - Expense UUID
   * @returns {Promise} Delete response
   */
  async deleteExpense(expenseId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/expenses/${expenseId}`
    );
    return response.data;
  }

  /**
   * Get expense summary for a project
   * @param {string} projectId - Project UUID
   * @param {number} year - Year to filter
   * @returns {Promise} Expense summary response
   */
  async getExpenseSummary(projectId, year) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses/summary`,
      { params: { year } }
    );
    return response.data;
  }

  /**
   * Get expenses by category for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Filter parameters
   * @param {string} params.fromDate - Filter from this date
   * @param {string} params.toDate - Filter up to this date
   * @returns {Promise} Category breakdown response
   */
  async getExpensesByCategory(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses/categories`,
      { params }
    );
    return response.data;
  }

  /**
   * Get total expenses for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Filter parameters
   * @param {string} params.fromDate - Filter from this date
   * @param {string} params.toDate - Filter up to this date
   * @returns {Promise} Total expenses response
   */
  async getTotalExpenses(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses/total`,
      { params }
    );
    return response.data;
  }

  /**
   * Get monthly expenses for a project
   * @param {string} projectId - Project UUID
   * @param {number} year - Year to filter
   * @returns {Promise} Monthly expenses response
   */
  async getMonthlyExpenses(projectId, year) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses/monthly`,
      { params: { year } }
    );
    return response.data;
  }

  /**
   * Export expenses for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (json/csv)
   * @param {string} params.fromDate - Filter from this date
   * @param {string} params.toDate - Filter up to this date
   * @returns {Promise} Export response
   */
  async exportExpenses(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses/export`,
      { params }
    );
    return response.data;
  }

  /**
   * Get expense statistics for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Statistics response
   */
  async getExpenseStatistics(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/expenses/statistics`
    );
    return response.data;
  }
}

// Create and export a singleton instance
const expenseService = new ExpenseService();
export default expenseService;
