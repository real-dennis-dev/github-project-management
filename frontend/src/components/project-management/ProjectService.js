// src/components/project-management/ProjectService.js

import axiosInstance from "../../services/axiosInstance";

const API_BASE = "/api";

/**
 * Project Management Service - Handles all project-related API calls
 */
class ProjectService {
  // ============================================
  // PROJECT CRUD OPERATIONS
  // ============================================

  /**
   * Get all projects with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   * @param {string} params.priority - Filter by priority
   * @param {string} params.search - Search by name or description
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise} Projects list response
   */
  async getProjects(params = {}) {
    const response = await axiosInstance.get(`${API_BASE}/projects`, {
      params,
    });
    return response.data;
  }

  /**
   * Get a single project by ID
   * @param {string} projectId - Project UUID
   * @returns {Promise} Project response
   */
  async getProjectById(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}`
    );
    return response.data;
  }

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} projectData.name - Project name (required)
   * @param {string} projectData.description - Project description
   * @param {string} projectData.status - Project status
   * @param {string} projectData.priority - Project priority
   * @param {number} projectData.completion_percentage - Completion percentage
   * @param {string[]} projectData.tech_stack - Technology stack
   * @param {string} projectData.repository_url - Repository URL
   * @param {string} projectData.start_date - Start date
   * @param {string} projectData.target_completion_date - Target completion date
   * @returns {Promise} Created project response
   */
  async createProject(projectData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects`,
      projectData
    );
    return response.data;
  }

  /**
   * Update a project
   * @param {string} projectId - Project UUID
   * @param {Object} projectData - Updated project data
   * @returns {Promise} Updated project response
   */
  async updateProject(projectId, projectData) {
    const response = await axiosInstance.put(
      `${API_BASE}/projects/${projectId}`,
      projectData
    );
    return response.data;
  }

  /**
   * Delete a project
   * @param {string} projectId - Project UUID
   * @returns {Promise} Delete response
   */
  async deleteProject(projectId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/projects/${projectId}`
    );
    return response.data;
  }

  // ============================================
  // FEATURE CRUD OPERATIONS
  // ============================================

  /**
   * Get all features for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.difficulty - Filter by difficulty
   * @param {string} params.search - Search by title
   * @returns {Promise} Features list response
   */
  async getFeatures(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/features`,
      { params }
    );
    return response.data;
  }

  /**
   * Get a single feature by ID
   * @param {string} featureId - Feature UUID
   * @returns {Promise} Feature response
   */
  async getFeatureById(featureId) {
    const response = await axiosInstance.get(
      `${API_BASE}/features/${featureId}`
    );
    return response.data;
  }

  /**
   * Create a new feature
   * @param {string} projectId - Project UUID
   * @param {Object} featureData - Feature data
   * @param {string} featureData.title - Feature title (required)
   * @param {string} featureData.description - Feature description
   * @param {string} featureData.status - Feature status
   * @param {string} featureData.difficulty - Feature difficulty
   * @param {number} featureData.estimated_days - Estimated days
   * @returns {Promise} Created feature response
   */
  async createFeature(projectId, featureData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/features`,
      featureData
    );
    return response.data;
  }

  /**
   * Update a feature
   * @param {string} featureId - Feature UUID
   * @param {Object} featureData - Updated feature data
   * @returns {Promise} Updated feature response
   */
  async updateFeature(featureId, featureData) {
    const response = await axiosInstance.put(
      `${API_BASE}/features/${featureId}`,
      featureData
    );
    return response.data;
  }

  /**
   * Delete a feature
   * @param {string} featureId - Feature UUID
   * @returns {Promise} Delete response
   */
  async deleteFeature(featureId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/features/${featureId}`
    );
    return response.data;
  }

  /**
   * Reorder features
   * @param {string} projectId - Project UUID
   * @param {Array} featureOrders - Array of {id, order_index}
   * @returns {Promise} Reorder response
   */
  async reorderFeatures(projectId, featureOrders) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/features/reorder`,
      { features: featureOrders }
    );
    return response.data;
  }

  // ============================================
  // SUBTASK CRUD OPERATIONS
  // ============================================

  /**
   * Get all subtasks for a feature
   * @param {string} featureId - Feature UUID
   * @returns {Promise} Subtasks list response
   */
  async getSubtasks(featureId) {
    const response = await axiosInstance.get(
      `${API_BASE}/features/${featureId}/subtasks`
    );
    return response.data;
  }

  /**
   * Create a new subtask
   * @param {string} featureId - Feature UUID
   * @param {Object} subtaskData - Subtask data
   * @param {string} subtaskData.title - Subtask title (required)
   * @param {boolean} subtaskData.is_completed - Is completed
   * @returns {Promise} Created subtask response
   */
  async createSubtask(featureId, subtaskData) {
    const response = await axiosInstance.post(
      `${API_BASE}/features/${featureId}/subtasks`,
      subtaskData
    );
    return response.data;
  }

  /**
   * Update a subtask
   * @param {string} subtaskId - Subtask UUID
   * @param {Object} subtaskData - Updated subtask data
   * @returns {Promise} Updated subtask response
   */
  async updateSubtask(subtaskId, subtaskData) {
    const response = await axiosInstance.put(
      `${API_BASE}/subtasks/${subtaskId}`,
      subtaskData
    );
    return response.data;
  }

  /**
   * Delete a subtask
   * @param {string} subtaskId - Subtask UUID
   * @returns {Promise} Delete response
   */
  async deleteSubtask(subtaskId) {
    const response = await axiosInstance.delete(
      `${API_BASE}/subtasks/${subtaskId}`
    );
    return response.data;
  }

  /**
   * Reorder subtasks
   * @param {string} featureId - Feature UUID
   * @param {Array} subtaskOrders - Array of {id, order_index}
   * @returns {Promise} Reorder response
   */
  async reorderSubtasks(featureId, subtaskOrders) {
    const response = await axiosInstance.post(
      `${API_BASE}/features/${featureId}/subtasks/reorder`,
      { subtasks: subtaskOrders }
    );
    return response.data;
  }

  // ============================================
  // BUG CRUD OPERATIONS
  // ============================================

  /**
   * Get all bugs for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.priority - Filter by priority
   * @param {string} params.search - Search by title
   * @returns {Promise} Bugs list response
   */
  async getBugs(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/bugs`,
      { params }
    );
    return response.data;
  }

  /**
   * Get a single bug by ID
   * @param {string} bugId - Bug UUID
   * @returns {Promise} Bug response
   */
  async getBugById(bugId) {
    const response = await axiosInstance.get(`${API_BASE}/bugs/${bugId}`);
    return response.data;
  }

  /**
   * Create a new bug
   * @param {string} projectId - Project UUID
   * @param {Object} bugData - Bug data
   * @param {string} bugData.title - Bug title (required)
   * @param {string} bugData.description - Bug description
   * @param {string} bugData.status - Bug status
   * @param {string} bugData.priority - Bug priority
   * @param {string} bugData.cause - Cause
   * @param {string} bugData.possible_fix - Possible fix
   * @param {string} bugData.assigned_to - Assigned to
   * @returns {Promise} Created bug response
   */
  async createBug(projectId, bugData) {
    const response = await axiosInstance.post(
      `${API_BASE}/projects/${projectId}/bugs`,
      bugData
    );
    return response.data;
  }

  /**
   * Update a bug
   * @param {string} bugId - Bug UUID
   * @param {Object} bugData - Updated bug data
   * @returns {Promise} Updated bug response
   */
  async updateBug(bugId, bugData) {
    const response = await axiosInstance.put(
      `${API_BASE}/bugs/${bugId}`,
      bugData
    );
    return response.data;
  }

  /**
   * Delete a bug
   * @param {string} bugId - Bug UUID
   * @returns {Promise} Delete response
   */
  async deleteBug(bugId) {
    const response = await axiosInstance.delete(`${API_BASE}/bugs/${bugId}`);
    return response.data;
  }

  // ============================================
  // PROJECT STATISTICS
  // ============================================

  /**
   * Get project statistics
   * @param {string} projectId - Project UUID
   * @returns {Promise} Statistics response
   */
  async getProjectStatistics(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/statistics`
    );
    return response.data;
  }

  /**
   * Get project dashboard data
   * @param {string} projectId - Project UUID
   * @returns {Promise} Dashboard data response
   */
  async getProjectDashboard(projectId) {
    const response = await axiosInstance.get(
      `${API_BASE}/projects/${projectId}/dashboard`
    );
    return response.data;
  }
}

// Create and export a singleton instance
const projectService = new ProjectService();
export default projectService;
