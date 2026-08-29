// src/services/projectService.js
import axiosInstance from "./axiosInstance";

class ProjectService {
  constructor() {
    this.basePath = "/api";
  }

  // ============ Projects ============

  async getProjects(params = {}) {
    const response = await axiosInstance.get(`${this.basePath}/projects`, {
      params,
    });
    return response.data;
  }

  async getProject(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}`
    );
    return response.data;
  }

  async createProject(data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects`,
      data
    );
    return response.data;
  }

  async updateProject(projectId, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/projects/${projectId}`,
      data
    );
    return response.data;
  }

  async deleteProject(projectId) {
    const response = await axiosInstance.delete(
      `${this.basePath}/projects/${projectId}`
    );
    return response.data;
  }

  async getProjectStats(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/stats`
    );
    return response.data;
  }

  // ============ Features ============

  async getFeatures(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/features`,
      { params }
    );
    return response.data;
  }

  async getFeature(featureId) {
    const response = await axiosInstance.get(
      `${this.basePath}/features/${featureId}`
    );
    return response.data;
  }

  async createFeature(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/features`,
      data
    );
    return response.data;
  }

  async updateFeature(featureId, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/features/${featureId}`,
      data
    );
    return response.data;
  }

  async deleteFeature(featureId) {
    const response = await axiosInstance.delete(
      `${this.basePath}/features/${featureId}`
    );
    return response.data;
  }

  async reorderFeatures(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/features/reorder`,
      data
    );
    return response.data;
  }

  // ============ Bugs ============

  async getBugs(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/bugs`,
      { params }
    );
    return response.data;
  }

  async getBug(bugId) {
    const response = await axiosInstance.get(`${this.basePath}/bugs/${bugId}`);
    return response.data;
  }

  async createBug(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/bugs`,
      data
    );
    return response.data;
  }

  async updateBug(bugId, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/bugs/${bugId}`,
      data
    );
    return response.data;
  }

  async deleteBug(bugId) {
    const response = await axiosInstance.delete(
      `${this.basePath}/bugs/${bugId}`
    );
    return response.data;
  }

  // ============ Subtasks ============

  async getSubtasks(featureId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/features/${featureId}/subtasks`,
      { params }
    );
    return response.data;
  }

  async getSubtask(subtaskId) {
    const response = await axiosInstance.get(
      `${this.basePath}/subtasks/${subtaskId}`
    );
    return response.data;
  }

  async createSubtask(featureId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/features/${featureId}/subtasks`,
      data
    );
    return response.data;
  }

  async updateSubtask(subtaskId, data) {
    const response = await axiosInstance.put(
      `${this.basePath}/subtasks/${subtaskId}`,
      data
    );
    return response.data;
  }

  async deleteSubtask(subtaskId) {
    const response = await axiosInstance.delete(
      `${this.basePath}/subtasks/${subtaskId}`
    );
    return response.data;
  }

  async reorderSubtasks(featureId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/features/${featureId}/subtasks/reorder`,
      data
    );
    return response.data;
  }
}

export const projectService = new ProjectService();
export default projectService;
