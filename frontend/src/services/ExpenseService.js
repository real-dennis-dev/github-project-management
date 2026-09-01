// src/services/expenseService.js
import axiosInstance from "./axiosInstance";

class ExpenseService {
  // Get all expenses for a project
  async getExpenses(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses`,
      { params }
    );
    return response.data;
  }

  // Create a new expense
  async createExpense(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/expenses`,
      data
    );
    return response.data;
  }

  // Get an expense by ID
  async getExpense(expenseId) {
    const response = await axiosInstance.get(`/expenses/${expenseId}`);
    return response.data;
  }

  // Update an expense
  async updateExpense(expenseId, data) {
    const response = await axiosInstance.put(`/expenses/${expenseId}`, data);
    return response.data;
  }

  // Delete an expense
  async deleteExpense(expenseId) {
    const response = await axiosInstance.delete(`/expenses/${expenseId}`);
    return response.data;
  }

  // Get expense summary
  async getSummary(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses/summary`,
      { params }
    );
    return response.data;
  }

  // Get expenses by category
  async getCategories(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses/categories`,
      { params }
    );
    return response.data;
  }

  // Get total expenses
  async getTotal(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses/total`,
      { params }
    );
    return response.data;
  }

  // Get monthly expenses
  async getMonthly(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses/monthly`,
      { params }
    );
    return response.data;
  }

  // Export expenses
  async exportExpenses(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses/export`,
      { params }
    );
    return response.data;
  }

  // Get expense statistics
  async getStatistics(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/expenses/statistics`
    );
    return response.data;
  }
  /**
   * Get expenses dashboard with statistics across all projects
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.fromDate - Filter from date
   * @param {string} params.toDate - Filter to date
   * @param {number} params.minAmount - Filter minimum amount
   * @param {number} params.maxAmount - Filter maximum amount
   * @param {string} params.vendor - Filter by vendor
   * @param {boolean} params.recurring - Filter by recurring status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(params = {}) {
    const response = await axiosInstance.get(`/expenses/dashboard`, { params });
    return response.data;
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
