// src/services/visionService.js
import axiosInstance from "./axiosInstance";

class VisionService {
  constructor() {
    this.basePath = "/vision-board";
  }

  // ============ Goal Endpoints ============

  async getGoals(params = {}) {
    const response = await axiosInstance.get(this.basePath, { params });
    return response.data;
  }

  async getGoal(id) {
    const response = await axiosInstance.get(`${this.basePath}/${id}`);
    return response.data;
  }

  async createGoal(data) {
    const response = await axiosInstance.post(this.basePath, data);
    return response.data;
  }

  async updateGoal(id, data) {
    const response = await axiosInstance.put(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async deleteGoal(id) {
    const response = await axiosInstance.delete(`${this.basePath}/${id}`);
    return response.data;
  }

  // ============ Project Linking ============

  async linkProject(goalId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/${goalId}/projects`,
      data
    );
    return response.data;
  }

  async unlinkProject(goalId, projectId) {
    const response = await axiosInstance.delete(
      `${this.basePath}/${goalId}/projects/${projectId}`
    );
    return response.data;
  }

  async getAvailableProjects(goalId) {
    const response = await axiosInstance.get(
      `${this.basePath}/${goalId}/available-projects`
    );
    return response.data;
  }

  // ============ Progress & Statistics ============

  async getGoalProgress(goalId) {
    const response = await axiosInstance.get(
      `${this.basePath}/${goalId}/progress`
    );
    return response.data;
  }

  async getStatistics() {
    const response = await axiosInstance.get(`${this.basePath}/statistics`);
    return response.data;
  }

  // ============ Options & Categories ============

  async getCategories() {
    const response = await axiosInstance.get(`${this.basePath}/categories`);
    return response.data;
  }

  async getOptions() {
    const response = await axiosInstance.get(`${this.basePath}/options`);
    return response.data;
  }

  // ============ Export ============

  async exportGoals(format = "json") {
    const response = await axiosInstance.get(`${this.basePath}/export`, {
      params: { format },
    });
    return response.data;
  }
}

export const visionService = new VisionService();
export default visionService;
