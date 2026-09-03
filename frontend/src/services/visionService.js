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

  async bulkDeleteGoals(ids) {
    const response = await axiosInstance.delete(`${this.basePath}/bulk`, {
      data: { ids },
    });
    return response.data;
  }

  async bulkUpdateStatus(ids, status) {
    const response = await axiosInstance.patch(`${this.basePath}/bulk/status`, {
      ids,
      status,
    });
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

  async getGoalLinkedProjects(goalId) {
    const response = await axiosInstance.get(
      `${this.basePath}/${goalId}/linked-projects`
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

  async getRecentActivities(limit = 10) {
    const response = await axiosInstance.get(`${this.basePath}/activities`, {
      params: { limit },
    });
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

  async exportGoals(format = "json", filters = {}) {
    const response = await axiosInstance.get(`${this.basePath}/export`, {
      params: { format, ...filters },
    });
    return response.data;
  }

  // ============ Dashboard ============

  async getDashboardData() {
    const [statistics, recentGoals, categories, options] = await Promise.all([
      this.getStatistics(),
      this.getGoals({ limit: 5, sortBy: "created_at", sortOrder: "DESC" }),
      this.getCategories(),
      this.getOptions(),
    ]);

    return {
      statistics: statistics.data,
      recentGoals: recentGoals.data,
      categories: categories.data,
      options: options.data,
    };
  }

  async getGoalsByStatus(status) {
    const response = await axiosInstance.get(this.basePath, {
      params: { status, limit: 100 },
    });
    return response.data;
  }

  async getCompletedGoalsCount() {
    const response = await axiosInstance.get(
      `${this.basePath}/statistics/completed`
    );
    return response.data;
  }

  async getActiveGoalsCount() {
    const response = await axiosInstance.get(
      `${this.basePath}/statistics/active`
    );
    return response.data;
  }
}

export const visionService = new VisionService();
export default visionService;
