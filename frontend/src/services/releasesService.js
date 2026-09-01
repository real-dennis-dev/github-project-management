// src/services/releasesService.js
import axiosInstance from "./axiosInstance";

class ReleasesService {
  // ============ Release Endpoints ============

  async getReleases(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/releases`,
      { params }
    );
    return response.data;
  }

  async getRelease(releaseId) {
    const response = await axiosInstance.get(`/releases/${releaseId}`);
    return response.data;
  }

  async createRelease(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/releases`,
      data
    );
    return response.data;
  }

  async updateRelease(releaseId, data) {
    const response = await axiosInstance.put(`/releases/${releaseId}`, data);
    return response.data;
  }

  async deleteRelease(releaseId) {
    const response = await axiosInstance.delete(`/releases/${releaseId}`);
    return response.data;
  }

  async updateReleaseStatus(releaseId, data) {
    const response = await axiosInstance.patch(
      `/releases/${releaseId}/status`,
      data
    );
    return response.data;
  }

  async addFeaturesToRelease(releaseId, data) {
    const response = await axiosInstance.post(
      `/releases/${releaseId}/features`,
      data
    );
    return response.data;
  }

  async removeFeatureFromRelease(releaseId, featureId) {
    const response = await axiosInstance.delete(
      `/releases/${releaseId}/features/${featureId}`
    );
    return response.data;
  }

  async getReleaseProgress(releaseId) {
    const response = await axiosInstance.get(`/releases/${releaseId}/progress`);
    return response.data;
  }

  async getReleaseChangelog(releaseId) {
    const response = await axiosInstance.get(
      `/releases/${releaseId}/changelog`
    );
    return response.data;
  }

  async getReleaseStatistics(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/releases/statistics`
    );
    return response.data;
  }

  // ============ Milestone Endpoints ============

  async getMilestones(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/milestones`,
      { params }
    );
    return response.data;
  }

  async getMilestone(milestoneId) {
    const response = await axiosInstance.get(`/milestones/${milestoneId}`);
    return response.data;
  }

  async createMilestone(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/milestones`,
      data
    );
    return response.data;
  }

  async updateMilestone(milestoneId, data) {
    const response = await axiosInstance.put(
      `/milestones/${milestoneId}`,
      data
    );
    return response.data;
  }

  async deleteMilestone(milestoneId) {
    const response = await axiosInstance.delete(`/milestones/${milestoneId}`);
    return response.data;
  }

  async updateMilestoneStatus(milestoneId, data) {
    const response = await axiosInstance.patch(
      `/milestones/${milestoneId}/status`,
      data
    );
    return response.data;
  }

  async getMilestoneProgress(milestoneId) {
    const response = await axiosInstance.get(
      `/milestones/${milestoneId}/progress`
    );
    return response.data;
  }

  async getOverdueMilestones(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/milestones/overdue`
    );
    return response.data;
  }

  async getMilestoneStatistics(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/milestones/statistics`
    );
    return response.data;
  }

  async bulkUpdateMilestones(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/milestones/bulk-update`,
      data
    );
    return response.data;
  }
  /**
   * Get combined dashboard data for releases and milestones across all projects
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {string} params.search - Search term
   * @param {string} params.type - Filter by type ('release' | 'milestone')
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(params = {}) {
    const response = await axiosInstance.get(`/releases-milestones/dashboard`, {
      params,
    });
    return response.data;
  }

  /**
   * Export all releases and milestones across projects
   * @param {Object} params - Export parameters
   * @param {string} params.format - 'json' or 'csv'
   * @param {string} params.type - Filter by type
   * @returns {Promise<Object>} Exported data
   */
  async exportAll(params = {}) {
    const response = await axiosInstance.get(`/releases-milestones/export`, {
      params,
    });
    return response.data;
  }
}

export const releasesService = new ReleasesService();
export default releasesService;
