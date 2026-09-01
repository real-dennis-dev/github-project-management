// src/services/progressService.js
import axiosInstance from "./axiosInstance";

class ProgressService {
  // Get timeline entries
  async getTimeline(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/timeline`,
      { params }
    );
    return response.data;
  }

  // Add timeline entry
  async addTimelineEntry(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/timeline`,
      data
    );
    return response.data;
  }

  // Update timeline entry
  async updateTimelineEntry(id, data) {
    const response = await axiosInstance.put(`/timeline/${id}`, data);
    return response.data;
  }

  // Delete timeline entry
  async deleteTimelineEntry(id) {
    const response = await axiosInstance.delete(`/timeline/${id}`);
    return response.data;
  }

  // Get progress overview
  async getProgressOverview(projectId, months = 12) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/progress-overview`,
      { params: { months } }
    );
    return response.data;
  }

  // Get monthly progress
  async getMonthlyProgress(projectId, params) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/monthly-progress`,
      { params }
    );
    return response.data;
  }

  // Generate progress report
  async getProgressReport(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/progress-report`,
      { params }
    );
    return response.data;
  }

  // Bulk add timeline entries
  async bulkAddTimelineEntries(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/timeline/bulk`,
      data
    );
    return response.data;
  }
  /**
   * Get global progress timeline statistics across all projects
   * @param {Object} params - Query parameters
   * @param {number} params.months - Number of months to include (default: 12)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.sort_by - Sort field (default: 'latest_activity')
   * @param {string} params.sort_order - Sort order 'asc' or 'desc' (default: 'desc')
   * @param {string} params.search - Search term for filtering projects
   * @returns {Promise<Object>} Global progress timeline stats
   */
  async getGlobalStats(params = {}) {
    const response = await axiosInstance.get(`/progress-timeline/stats`, {
      params,
    });
    return response.data;
  }

  /**
   * Export all progress timeline data
   * @param {Object} params - Export parameters
   * @param {string} params.format - 'json' or 'csv'
   * @param {number} params.months - Number of months to include
   * @returns {Promise<Object>} Exported data
   */
  async exportAllData(params = {}) {
    const response = await axiosInstance.get(`/progress-timeline/export`, {
      params,
    });
    return response.data;
  }
}

export const progressService = new ProgressService();
export default progressService;
