// src/services/progressService.js
import axiosInstance from "./axiosInstance";

class ProgressService {
  constructor() {
    this.basePath = "/api";
  }

  // Get timeline entries
  async getTimeline(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/timeline`,
      { params }
    );
    return response.data;
  }

  // Add timeline entry
  async addTimelineEntry(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/timeline`,
      data
    );
    return response.data;
  }

  // Update timeline entry
  async updateTimelineEntry(id, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/timeline/${id}`,
      data
    );
    return response.data;
  }

  // Delete timeline entry
  async deleteTimelineEntry(id) {
    const response = await axiosInstance.delete(
      `${this.basePath}/timeline/${id}`
    );
    return response.data;
  }

  // Get progress overview
  async getProgressOverview(projectId, months = 12) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/progress-overview`,
      { params: { months } }
    );
    return response.data;
  }

  // Get monthly progress
  async getMonthlyProgress(projectId, params) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/monthly-progress`,
      { params }
    );
    return response.data;
  }

  // Generate progress report
  async getProgressReport(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/progress-report`,
      { params }
    );
    return response.data;
  }

  // Bulk add timeline entries
  async bulkAddTimelineEntries(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/timeline/bulk`,
      data
    );
    return response.data;
  }
}

export const progressService = new ProgressService();
export default progressService;
