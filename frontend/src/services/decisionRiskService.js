// src/services/decisionRiskService.js
import axiosInstance from "./axiosInstance";

/**
 * Decision Service
 */
export const decisionService = {
  /**
   * Get all decisions for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.impact - Filter by impact level
   * @param {string} params.fromDate - Filter from date
   * @param {string} params.toDate - Filter to date
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order
   */
  getDecisions: async (projectId, params = {}) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/decisions`,
      { params }
    );
    return response.data;
  },

  /**
   * Get a single decision by ID
   * @param {string} id - Decision UUID
   */
  getDecision: async (id) => {
    const response = await axiosInstance.get(`/api/decisions/${id}`);
    return response.data;
  },

  /**
   * Create a new decision
   * @param {string} projectId - Project UUID
   * @param {Object} data - Decision data
   */
  createDecision: async (projectId, data) => {
    const response = await axiosInstance.post(
      `/api/projects/${projectId}/decisions`,
      data
    );
    return response.data;
  },

  /**
   * Update a decision
   * @param {string} id - Decision UUID
   * @param {Object} data - Decision update data
   */
  updateDecision: async (id, data) => {
    const response = await axiosInstance.put(`/api/decisions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a decision
   * @param {string} id - Decision UUID
   */
  deleteDecision: async (id) => {
    const response = await axiosInstance.delete(`/api/decisions/${id}`);
    return response.data;
  },

  /**
   * Export decisions
   * @param {string} projectId - Project UUID
   * @param {string} format - Export format (json, csv)
   */
  exportDecisions: async (projectId, format = "json") => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/decisions/export`,
      { params: { format } }
    );
    return response.data;
  },

  /**
   * Get decision statistics
   * @param {string} projectId - Project UUID
   */
  getDecisionStatistics: async (projectId) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/decisions/statistics`
    );
    return response.data;
  },
};

/**
 * Risk Service
 */
export const riskService = {
  /**
   * Get all risks for a project
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.level - Filter by risk level
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order
   */
  getRisks: async (projectId, params = {}) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/risks`,
      { params }
    );
    return response.data;
  },

  /**
   * Get a single risk by ID
   * @param {string} id - Risk UUID
   */
  getRisk: async (id) => {
    const response = await axiosInstance.get(`/api/risks/${id}`);
    return response.data;
  },

  /**
   * Create a new risk
   * @param {string} projectId - Project UUID
   * @param {Object} data - Risk data
   */
  createRisk: async (projectId, data) => {
    const response = await axiosInstance.post(
      `/api/projects/${projectId}/risks`,
      data
    );
    return response.data;
  },

  /**
   * Update a risk
   * @param {string} id - Risk UUID
   * @param {Object} data - Risk update data
   */
  updateRisk: async (id, data) => {
    const response = await axiosInstance.put(`/api/risks/${id}`, data);
    return response.data;
  },

  /**
   * Update risk status
   * @param {string} id - Risk UUID
   * @param {string} status - New status
   */
  updateRiskStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/api/risks/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Delete a risk
   * @param {string} id - Risk UUID
   */
  deleteRisk: async (id) => {
    const response = await axiosInstance.delete(`/api/risks/${id}`);
    return response.data;
  },

  /**
   * Get risks by status
   * @param {string} projectId - Project UUID
   * @param {string} status - Risk status
   */
  getRisksByStatus: async (projectId, status) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/risks/status/${status}`
    );
    return response.data;
  },

  /**
   * Generate risk report
   * @param {string} projectId - Project UUID
   */
  getRiskReport: async (projectId) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/risks/report`
    );
    return response.data;
  },

  /**
   * Get project risk score
   * @param {string} projectId - Project UUID
   */
  getRiskScore: async (projectId) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/risks/score`
    );
    return response.data;
  },

  /**
   * Get risk matrix
   * @param {string} projectId - Project UUID
   */
  getRiskMatrix: async (projectId) => {
    const response = await axiosInstance.get(
      `/api/projects/${projectId}/risks/matrix`
    );
    return response.data;
  },
};
