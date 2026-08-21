// src/components/tech-debt/TechDebtService.js

import axiosInstance from "../../services/axiosInstance";

const API_BASE = "/api";

/**
 * Tech Debt Service - Handles all tech debt-related API calls
 */
class TechDebtService {
  /**
   * Get all tech debt items for a project with pagination and filters
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.priority - Filter by priority
   * @param {string} params.status - Filter by status
   * @param {string} params.search - Search in title and description
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise} Tech debt list response
   */
  async getTechDebtItems(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/tech-debt`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new tech debt item
   * @param {string} projectId - Project UUID
   * @param {Object} techDebtData - Tech debt data
   * @param {string} techDebtData.title - Title
   * @param {string} techDebtData.description - Description
   * @param {string} techDebtData.reason - Reason
   * @param {string} techDebtData.impact - Impact
   * @param {string} techDebtData.priority - Priority enum
   * @param {string} techDebtData.status - Status enum
   * @param {number} techDebtData.estimated_effort_hours - Estimated effort hours
   * @returns {Promise} Created tech debt response
   */
  async createTechDebt(projectId, techDebtData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/tech-debt`,
      techDebtData
    );
    return response.data;
  }

  /**
   * Get a tech debt item by ID
   * @param {string} techDebtId - Tech debt UUID
   * @returns {Promise} Tech debt response
   */
  async getTechDebtById(techDebtId) {
    const response = await axiosInstance.get(
      `${API_BASE}/tech-debt/${techDebtId}`
    );
    return response.data;
  }

  /**
   * Update a tech debt item
   * @param {string} techDebtId - Tech debt UUID
   * @param {Object} techDebtData - Updated tech debt data
   * @returns {Promise} Updated tech debt response
   */
  async updateTechDebt(techDebtId, techDebtData) {
    const response = await axiosInstance.put(
      `${API_BASE}/tech-debt/${techDebtId}`,
      techDebtData
    );
    return response.data;
  }

  /**
   * Update tech debt status
   * @param {string} techDebtId - Tech debt UUID
   * @param {string} status - New status
   * @returns {Promise} Updated tech debt response
   */
  async updateStatus(techDebtId, status) {
    const response = await axiosInstance.patch(
      `${API_BASE}/tech-debt/${techDebtId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Delete a tech debt item
   * @param {string} techDebtId - Tech debt UUID
   * @returns {Promise} Delete response
   */
  async deleteTechDebt(techDebtId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/tech-debt/${techDebtId}`
    );
    return response.data;
  }

  /**
   * Get tech debt overview for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Overview response
   */
  async getTechDebtOverview(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/tech-debt/overview`
    );
    return response.data;
  }

  /**
   * Get tech debt score for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Score response
   */
  async getTechDebtScore(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/tech-debt/score`
    );
    return response.data;
  }

  /**
   * Get tech debt statistics for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Statistics response
   */
  async getTechDebtStatistics(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/tech-debt/statistics`
    );
    return response.data;
  }

  /**
   * Export tech debt items
   * @param {string} projectId - Project UUID
   * @param {string} format - Export format (json/csv)
   * @returns {Promise} Export response
   */
  async exportTechDebt(projectId, format = "json") {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/tech-debt/export`,
      { params: { format } }
    );
    return response.data;
  }

  /**
   * Get refactoring suggestions
   * @param {string} projectId - Project UUID
   * @returns {Promise} Suggestions response
   */
  async getRefactoringSuggestions(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/tech-debt/refactoring-suggestions`
    );
    return response.data;
  }
}

// Create and export a singleton instance
const techDebtService = new TechDebtService();
export default techDebtService;
