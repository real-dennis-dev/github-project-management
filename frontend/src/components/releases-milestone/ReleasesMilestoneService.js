// src/components/releases-milestone/ReleasesMilestoneService.js

import axiosInstance from "../../services/axiosInstance";

const API_BASE = "/api";

/**
 * Releases & Milestones Service - Handles all release and milestone API calls
 */
class ReleasesMilestoneService {
  // ============================================
  // RELEASE ENDPOINTS
  // ============================================

  /**
   * Get all releases for a project with pagination and filters
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise} Releases list response
   */
  async getReleases(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/releases`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new release
   * @param {string} projectId - Project UUID
   * @param {Object} releaseData - Release data
   * @param {string} releaseData.version - Semantic version
   * @param {string} releaseData.description - Description
   * @param {string} releaseData.status - Status enum
   * @param {string} releaseData.release_date - Release date
   * @param {Array} releaseData.features - Feature IDs
   * @returns {Promise} Created release response
   */
  async createRelease(projectId, releaseData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/releases`,
      releaseData
    );
    return response.data;
  }

  /**
   * Get a release by ID
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Release response
   */
  async getReleaseById(releaseId) {
    const response = await axiosInstance.get(
      `${API_BASE}/releases/${releaseId}`
    );
    return response.data;
  }

  /**
   * Update a release
   * @param {string} releaseId - Release UUID
   * @param {Object} releaseData - Updated release data
   * @returns {Promise} Updated release response
   */
  async updateRelease(releaseId, releaseData) {
    const response = await axiosInstance.put(
      `${API_BASE}/releases/${releaseId}`,
      releaseData
    );
    return response.data;
  }

  /**
   * Delete a release
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Delete response
   */
  async deleteRelease(releaseId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/releases/${releaseId}`
    );
    return response.data;
  }

  /**
   * Update release status
   * @param {string} releaseId - Release UUID
   * @param {string} status - New status
   * @returns {Promise} Updated release response
   */
  async updateReleaseStatus(releaseId, status) {
    const response = await axiosInstance.patch(
      `${API_BASE}/releases/${releaseId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Add features to a release
   * @param {string} releaseId - Release UUID
   * @param {Array} featureIds - Array of feature UUIDs
   * @returns {Promise} Response with added features
   */
  async addFeaturesToRelease(releaseId, featureIds) {
    const response = await axiosInstance.post(
      `${API_BASE}/releases/${releaseId}/features`,
      { featureIds }
    );
    return response.data;
  }

  /**
   * Remove a feature from a release
   * @param {string} releaseId - Release UUID
   * @param {string} featureId - Feature UUID
   * @returns {Promise} Response
   */
  async removeFeatureFromRelease(releaseId, featureId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/releases/${releaseId}/features/${featureId}`
    );
    return response.data;
  }

  /**
   * Get release progress
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Release progress response
   */
  async getReleaseProgress(releaseId) {
    const response = await axiosInstance.get(
      `${API_BASE}/releases/${releaseId}/progress`
    );
    return response.data;
  }

  /**
   * Generate changelog for a release
   * @param {string} releaseId - Release UUID
   * @returns {Promise} Changelog response
   */
  async generateChangelog(releaseId) {
    const response = await axiosInstance.get(
      `${API_BASE}/releases/${releaseId}/changelog`
    );
    return response.data;
  }

  /**
   * Get release statistics for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Release statistics response
   */
  async getReleaseStatistics(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/releases/statistics`
    );
    return response.data;
  }

  // ============================================
  // MILESTONE ENDPOINTS
  // ============================================

  /**
   * Get all milestones for a project with pagination and filters
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise} Milestones list response
   */
  async getMilestones(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/milestones`,
      { params }
    );
    return response.data;
  }

  /**
   * Create a new milestone
   * @param {string} projectId - Project UUID
   * @param {Object} milestoneData - Milestone data
   * @param {string} milestoneData.name - Name
   * @param {string} milestoneData.description - Description
   * @param {string} milestoneData.status - Status enum
   * @param {string} milestoneData.target_date - Target date
   * @param {string} milestoneData.completed_date - Completed date
   * @param {number} milestoneData.progress_percentage - Progress percentage
   * @returns {Promise} Created milestone response
   */
  async createMilestone(projectId, milestoneData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/milestones`,
      milestoneData
    );
    return response.data;
  }

  /**
   * Get a milestone by ID
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise} Milestone response
   */
  async getMilestoneById(milestoneId) {
    const response = await axiosInstance.get(
      `${API_BASE}/milestones/${milestoneId}`
    );
    return response.data;
  }

  /**
   * Update a milestone
   * @param {string} milestoneId - Milestone UUID
   * @param {Object} milestoneData - Updated milestone data
   * @returns {Promise} Updated milestone response
   */
  async updateMilestone(milestoneId, milestoneData) {
    const response = await axiosInstance.put(
      `${API_BASE}/milestones/${milestoneId}`,
      milestoneData
    );
    return response.data;
  }

  /**
   * Delete a milestone
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise} Delete response
   */
  async deleteMilestone(milestoneId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/milestones/${milestoneId}`
    );
    return response.data;
  }

  /**
   * Update milestone status
   * @param {string} milestoneId - Milestone UUID
   * @param {string} status - New status
   * @returns {Promise} Updated milestone response
   */
  async updateMilestoneStatus(milestoneId, status) {
    const response = await axiosInstance.patch(
      `${API_BASE}/milestones/${milestoneId}/status`,
      { status }
    );
    return response.data;
  }

  /**
   * Get milestone progress
   * @param {string} milestoneId - Milestone UUID
   * @returns {Promise} Milestone progress response
   */
  async getMilestoneProgress(milestoneId) {
    const response = await axiosInstance.get(
      `${API_BASE}/milestones/${milestoneId}/progress`
    );
    return response.data;
  }

  /**
   * Get overdue milestones for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Overdue milestones response
   */
  async getOverdueMilestones(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/milestones/overdue`
    );
    return response.data;
  }

  /**
   * Get milestone statistics for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Milestone statistics response
   */
  async getMilestoneStatistics(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/milestones/statistics`
    );
    return response.data;
  }

  /**
   * Bulk update milestone progress
   * @param {string} projectId - Project UUID
   * @param {Array} updates - Array of {id, progress_percentage}
   * @returns {Promise} Bulk update response
   */
  async bulkUpdateMilestones(projectId, updates) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/milestones/bulk-update`,
      { updates }
    );
    return response.data;
  }
}

// Create and export a singleton instance
const releasesMilestoneService = new ReleasesMilestoneService();
export default releasesMilestoneService;
