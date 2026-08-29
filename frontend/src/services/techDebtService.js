// src/services/techDebtService.js
import axiosInstance from "./axiosInstance";

class TechDebtService {
  constructor() {
    this.basePath = "/api";
  }

  // Get all tech debt items for a project
  async getItems(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/tech-debt`,
      { params }
    );
    return response.data;
  }

  // Create a new tech debt item
  async createItem(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/tech-debt`,
      data
    );
    return response.data;
  }

  // Get a tech debt item by ID
  async getItem(id) {
    const response = await axiosInstance.get(
      `${this.basePath}/tech-debt/${id}`
    );
    return response.data;
  }

  // Update a tech debt item
  async updateItem(id, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/tech-debt/${id}`,
      data
    );
    return response.data;
  }

  // Update tech debt status
  async updateStatus(id, data) {
    const response = await axiosInstance.patch(
      `${this.basePath}/tech-debt/${id}/status`,
      data
    );
    return response.data;
  }

  // Delete a tech debt item
  async deleteItem(id) {
    const response = await axiosInstance.delete(
      `${this.basePath}/tech-debt/${id}`
    );
    return response.data;
  }

  // Get tech debt overview
  async getOverview(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/tech-debt/overview`
    );
    return response.data;
  }

  // Get tech debt score
  async getScore(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/tech-debt/score`
    );
    return response.data;
  }

  // Get tech debt statistics
  async getStatistics(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/tech-debt/statistics`
    );
    return response.data;
  }

  // Export tech debt items
  async exportItems(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/tech-debt/export`,
      { params }
    );
    return response.data;
  }

  // Get refactoring suggestions
  async getRefactoringSuggestions(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/tech-debt/refactoring-suggestions`
    );
    return response.data;
  }
}

export const techDebtService = new TechDebtService();
export default techDebtService;
