// src/components/subscriptions/SubscriptionsService.js

import axiosInstance from "../../utils/axiosInstance";

/**
 * Subscriptions Service - Handles all release and milestone API calls
 */
class SubscriptionsService {
  // ============================================
  // RELEASE ENDPOINTS
  // ============================================

  /**
   * Get all releases for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order
   * @returns {Promise} Releases list response
   */
  async getReleases(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/releases`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new release
   * @param {string} projectId - Project UUID
   * @param {Object} data - Release data
   * @param {string} data.version - Version number (e.g., 1.0.0)
   * @param {string} data.description - Release description
   * @param {string} data.status - Release status
   * @param {Array<string>} data.features - Feature IDs
   * @param {string} data.release_date - Release date
   * @returns {Promise} Created release response
   */
  async createRelease(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/releases`,
      data
    );
    return response.data;
  }

  /**
   * Get a release by ID
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Release response
   */
  async getReleaseById(releaseId) {
    const response = await axiosInstance.get(`/releases/${releaseId}`);
    return response.data;
  }

  /**
   * Update a release
   * @param {string} releaseId - Release UUID
   * @param {Object} data - Updated release data
   * @returns {Promise} Updated release response
   */
  async updateRelease(releaseId, data) {
    const response = await axiosInstance.put(`/releases/${releaseId}`, data);
    return response.data;
  }

  /**
   * Update release status
   * @param {string} releaseId - Release UUID
   * @param {string} status - New status
   * @returns {Promise} Status update response
   */
  async updateReleaseStatus(releaseId, status) {
    const response = await axiosInstance.patch(
      `/releases/${releaseId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Delete a release
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Delete response
   */
  async deleteRelease(releaseId) {
    const response = await axiosInstance.delete(`/releases/${releaseId}`);
    return response.data;
  }

  /**
   * Add features to a release
   * @param {string} releaseId - Release UUID
   * @param {Array<string>} featureIds - Feature IDs to add
   * @returns {Promise} Add features response
   */
  async addFeaturesToRelease(releaseId, featureIds) {
    const response = await axiosInstance.post(
      `/releases/${releaseId}/features`,
      { featureIds }
    );
    return response.data;
  }

  /**
   * Remove a feature from a release
   * @param {string} releaseId - Release UUID
   * @param {string} featureId - Feature UUID to remove
   * @returns {Promise} Remove feature response
   */
  async removeFeatureFromRelease(releaseId, featureId) {
    const response = await axiosInstance.delete(
      `/releases/${releaseId}/features/${featureId}`
    );
    return response.data;
  }

  /**
   * Get release progress
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Release progress response
   */
  async getReleaseProgress(releaseId) {
    const response = await axiosInstance.get(`/releases/${releaseId}/progress`);
    return response.data;
  }

  /**
   * Generate release changelog
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Changelog response
   */
  async generateChangelog(releaseId) {
    const response = await axiosInstance.get(
      `/releases/${releaseId}/changelog`
    );
    return response.data;
  }

  /**
   * Get release statistics
   * @param {string} projectId - Project UUID
   * @returns {Promise} Release statistics response
   */
  async getReleaseStatistics(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/releases/statistics`
    );
    return response.data;
  }

  // ============================================
  // MILESTONE ENDPOINTS
  // ============================================

  /**
   * Get all milestones for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order
   * @returns {Promise} Milestones list response
   */
  async getMilestones(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/milestones`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new milestone
   * @param {string} projectId - Project UUID
   * @param {Object} data - Milestone data
   * @param {string} data.name - Milestone name
   * @param {string} data.description - Milestone description
   * @param {string} data.status - Milestone status
   * @param {string} data.target_date - Target date
   * @param {string} data.completed_date - Completed date
   * @param {number} data.progress_percentage - Progress percentage
   * @returns {Promise} Created milestone response
   */
  async createMilestone(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/milestones`,
      data
    );
    return response.data;
  }

  /**
   * Get a milestone by ID
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise} Milestone response
   */
  async getMilestoneById(milestoneId) {
    const response = await axiosInstance.get(`/milestones/${milestoneId}`);
    return response.data;
  }

  /**
   * Update a milestone
   * @param {string} milestoneId - Milestone UUID
   * @param {Object} data - Updated milestone data
   * @returns {Promise} Updated milestone response
   */
  async updateMilestone(milestoneId, data) {
    const response = await axiosInstance.put(
      `/milestones/${milestoneId}`,
      data
    );
    return response.data;
  }

  /**
   * Update milestone status
   * @param {string} milestoneId - Milestone UUID
   * @param {string} status - New status
   * @returns {Promise} Status update response
   */
  async updateMilestoneStatus(milestoneId, status) {
    const response = await axiosInstance.patch(
      `/milestones/${milestoneId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Delete a milestone
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise} Delete response
   */
  async deleteMilestone(milestoneId) {
    const response = await axiosInstance.delete(`/milestones/${milestoneId}`);
    return response.data;
  }

  /**
   * Get milestone progress
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise} Milestone progress response
   */
  async getMilestoneProgress(milestoneId) {
    const response = await axiosInstance.get(
      `/milestones/${milestoneId}/progress`
    );
    return response.data;
  }

  /**
   * Get overdue milestones
   * @param {string} projectId - Project UUID
   * @returns {Promise} Overdue milestones response
   */
  async getOverdueMilestones(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/milestones/overdue`
    );
    return response.data;
  }

  /**
   * Get milestone statistics
   * @param {string} projectId - Project UUID
   * @returns {Promise} Milestone statistics response
   */
  async getMilestoneStatistics(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/milestones/statistics`
    );
    return response.data;
  }

  /**
   * Bulk update milestone progress
   * @param {string} projectId - Project UUID
   * @param {Array<{id: string, progress_percentage: number}>} updates - Progress updates
   * @returns {Promise} Bulk update response
   */
  async bulkUpdateProgress(projectId, updates) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/milestones/bulk-update`,
      { updates }
    );
    return response.data;
  }
}

// Create and export a singleton instance
const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
