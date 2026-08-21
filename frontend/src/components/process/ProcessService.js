// src/components/process/ProcessService.js

import axiosInstance from "../../services/axiosInstance";

const API_BASE = "/api";

/**
 * Process/Progress Service - Handles all progress & timeline API calls
 */
class ProcessService {
  /**
   * Get project timeline with filtering and pagination
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.from_date - Start date (ISO format)
   * @param {string} params.to_date - End date (ISO format)
   * @param {string} params.feature_name - Filter by feature name
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_order - Sort order (asc/desc)
   * @returns {Promise} Timeline response
   */
  async getTimeline(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/timeline`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new timeline entry (upsert)
   * @param {string} projectId - Project UUID
   * @param {Object} entryData - Timeline entry data
   * @param {string} entryData.month_year - First day of month (YYYY-MM-DD)
   * @param {string} entryData.feature_name - Feature name
   * @param {number} entryData.progress_percentage - Progress percentage (0-100)
   * @returns {Promise} Created/updated entry response
   */
  async createTimelineEntry(projectId, entryData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/timeline`,
      entryData
    );
    return response.data;
  }

  /**
   * Bulk create timeline entries
   * @param {string} projectId - Project UUID
   * @param {Array} entries - Array of timeline entries
   * @returns {Promise} Bulk create response
   */
  async bulkCreateTimelineEntries(projectId, entries) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/timeline/bulk`,
      { entries }
    );
    return response.data;
  }

  /**
   * Update a timeline entry
   * @param {string} entryId - Timeline entry UUID
   * @param {Object} entryData - Updated timeline entry data
   * @returns {Promise} Updated entry response
   */
  async updateTimelineEntry(entryId, entryData) {
    const response = await axiosInstance.put(
      `${API_BASE}/timeline/${entryId}`,
      entryData
    );
    return response.data;
  }

  /**
   * Delete a timeline entry
   * @param {string} entryId - Timeline entry UUID
   * @returns {Promise} Delete response
   */
  async deleteTimelineEntry(entryId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/timeline/${entryId}`
    );
    return response.data;
  }

  /**
   * Get progress overview for a project
   * @param {string} projectId - Project UUID
   * @param {number} months - Number of months to analyze
   * @returns {Promise} Progress overview response
   */
  async getProgressOverview(projectId, months = 12) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/progress-overview`,
      { params: { months } }
    );
    return response.data;
  }

  /**
   * Get monthly progress for a project
   * @param {string} projectId - Project UUID
   * @param {string} month - Month to analyze (YYYY-MM-DD)
   * @param {string} feature_name - Filter by specific feature
   * @returns {Promise} Monthly progress response
   */
  async getMonthlyProgress(projectId, month, feature_name = null) {
    const params = { month };
    if (feature_name) params.feature_name = feature_name;
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/monthly-progress`,
      { params }
    );
    return response.data;
  }

  /**
   * Generate progress report
   * @param {string} projectId - Project UUID
   * @param {Object} params - Report parameters
   * @param {number} params.months - Number of months to include
   * @param {string} params.format - Report format (json/csv/pdf)
   * @returns {Promise} Report response
   */
  async generateProgressReport(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/progress-report`,
      { params }
    );
    return response.data;
  }

  /**
   * Get available features for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Features list response
   */
  async getProjectFeatures(projectId) {
    // This might be a separate endpoint or extracted from timeline
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/features`
    );
    return response.data;
  }
}

// Create and export a singleton instance
const processService = new ProcessService();
export default processService;
