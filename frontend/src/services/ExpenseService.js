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
}

export const expenseService = new ExpenseService();
export default expenseService;
