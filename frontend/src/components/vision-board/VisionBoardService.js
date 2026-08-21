// src/components/vision-board/VisionBoardService.js

import axiosInstance from "../../services/axiosInstance";

const API_BASE = "/api";

/**
 * Vision Board Service - Handles all vision board-related API calls
 */
class VisionBoardService {
  /**
   * Get all vision goals with pagination and filters
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.category - Filter by category
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise} Vision goals response
   */
  async getVisionGoals(params = {}) {
    const response = await axiosInstance.get(`${API_BASE}/vision-board`, {
      params,
    });
    return response.data;
  }

  /**
   * Create a new vision goal
   * @param {Object} goalData - Vision goal data
   * @param {string} goalData.goal - Goal description (required)
   * @param {string} goalData.description - Detailed description
   * @param {string} goalData.target_timeline - Target timeline
   * @param {number} goalData.priority - Priority (0-10)
   * @param {string} goalData.category - Category
   * @param {string} goalData.status - Status enum
   * @returns {Promise} Created vision goal response
   */
  async createVisionGoal(goalData) {
    const response = await axiosInstance.post(
      `${API_BASE}/vision-board`,
      goalData
    );
    return response.data;
  }

  /**
   * Get a vision goal by ID
   * @param {string} goalId - Vision goal UUID
   * @returns {Promise} Vision goal response
   */
  async getVisionGoalById(goalId) {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/${goalId}`
    );
    return response.data;
  }

  /**
   * Update a vision goal
   * @param {string} goalId - Vision goal UUID
   * @param {Object} goalData - Updated vision goal data
   * @returns {Promise} Updated vision goal response
   */
  async updateVisionGoal(goalId, goalData) {
    const response = await axiosInstance.put(
      `${API_BASE}/vision-board/${goalId}`,
      goalData
    );
    return response.data;
  }

  /**
   * Delete a vision goal
   * @param {string} goalId - Vision goal UUID
   * @returns {Promise} Delete response
   */
  async deleteVisionGoal(goalId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/vision-board/${goalId}`
    );
    return response.data;
  }

  /**
   * Link a project to a vision goal
   * @param {string} goalId - Vision goal UUID
   * @param {string} projectId - Project UUID
   * @returns {Promise} Link response
   */
  async linkProjectToGoal(goalId, projectId) {
    const response = await axiosInstance.post(
      `${API_BASE}/vision-board/${goalId}/projects`,
      { project_id: projectId }
    );
    return response.data;
  }

  /**
   * Unlink a project from a vision goal
   * @param {string} goalId - Vision goal UUID
   * @param {string} projectId - Project UUID
   * @returns {Promise} Unlink response
   */
  async unlinkProjectFromGoal(goalId, projectId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/vision-board/${goalId}/projects/${projectId}`
    );
    return response.data;
  }

  /**
   * Get goal progress
   * @param {string} goalId - Vision goal UUID
   * @returns {Promise} Progress response
   */
  async getGoalProgress(goalId) {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/${goalId}/progress`
    );
    return response.data;
  }

  /**
   * Get available projects for linking
   * @param {string} goalId - Vision goal UUID
   * @returns {Promise} Available projects response
   */
  async getAvailableProjects(goalId) {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/${goalId}/available-projects`
    );
    return response.data;
  }

  /**
   * Get all categories
   * @returns {Promise} Categories response
   */
  async getCategories() {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/categories`
    );
    return response.data;
  }

  /**
   * Get vision board statistics
   * @returns {Promise} Statistics response
   */
  async getStatistics() {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/statistics`
    );
    return response.data;
  }

  /**
   * Get UI options
   * @returns {Promise} Options response
   */
  async getOptions() {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/options`
    );
    return response.data;
  }

  /**
   * Export vision goals
   * @param {string} format - Export format (json/csv)
   * @returns {Promise} Export response
   */
  async exportVisionGoals(format = "json") {
    const response = await axiosInstance.get(
      `${API_BASE}/vision-board/export`,
      { params: { format } }
    );
    return response.data;
  }
}

// Create and export a singleton instance
const visionBoardService = new VisionBoardService();
export default visionBoardService;
