// src/services/techDebtService.js
import axiosInstance from "./axiosInstance";

class TechDebtService {
  // ============ Existing Methods ============

  // Get all tech debt items for a project
  async getItems(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/tech-debt`,
      { params }
    );
    return response.data;
  }

  // Create a new tech debt item
  async createItem(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/tech-debt`,
      data
    );
    return response.data;
  }

  // Get a tech debt item by ID
  async getItem(id) {
    const response = await axiosInstance.get(`/tech-debt/${id}`);
    return response.data;
  }

  // Update a tech debt item
  async updateItem(id, data) {
    const response = await axiosInstance.put(`/tech-debt/${id}`, data);
    return response.data;
  }

  // Update tech debt status
  async updateStatus(id, data) {
    const response = await axiosInstance.patch(`/tech-debt/${id}/status`, data);
    return response.data;
  }

  // Delete a tech debt item
  async deleteItem(id) {
    const response = await axiosInstance.delete(`/tech-debt/${id}`);
    return response.data;
  }

  // Get tech debt overview
  async getOverview(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/tech-debt/overview`
    );
    return response.data;
  }

  // Get tech debt score
  async getScore(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/tech-debt/score`
    );
    return response.data;
  }

  // Get tech debt statistics
  async getStatistics(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/tech-debt/statistics`
    );
    return response.data;
  }

  // Export tech debt items
  async exportItems(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/tech-debt/export`,
      { params }
    );
    return response.data;
  }

  // Get refactoring suggestions
  async getRefactoringSuggestions(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/tech-debt/refactoring-suggestions`
    );
    return response.data;
  }

  /**
   * Get global technical debt statistics across all projects
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number for latest items (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.search - Search term for filtering
   * @param {string} params.priority - Filter by priority
   * @param {string} params.status - Filter by status
   * @returns {Promise<Object>} Global tech debt stats
   */
  async getGlobalStats(params = {}) {
    const response = await axiosInstance.get(`/tech-debt/stats`, { params });
    return response.data;
  }

  /**
   * Export all tech debt items across projects
   * @param {Object} params - Export parameters
   * @param {string} params.format - 'json' or 'csv'
   * @returns {Promise<Object>} Exported data
   */
  async exportAllItems(params = {}) {
    const response = await axiosInstance.get(`/tech-debt/export-all`, {
      params,
    });
    return response.data;
  }
}

export const techDebtService = new TechDebtService();
export default techDebtService;
