// src/components/decision-risks/services/decisionsRisksService.js
import axiosInstance from "../../../services/axiosInstance";

class DecisionsRisksService {
  // ========== Decision Endpoints ==========

  /**
   * Get all decisions for a project
   */
  async getDecisions(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/decisions`,
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Create a new decision
   */
  async createDecision(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/decisions`,
      data
    );
    return response.data;
  }

  /**
   * Get a decision by ID
   */
  async getDecision(id) {
    const response = await axiosInstance.get(`/decisions/${id}`);
    return response.data;
  }

  /**
   * Update a decision
   */
  async updateDecision(id, data) {
    const response = await axiosInstance.put(`/decisions/${id}`, data);
    return response.data;
  }

  /**
   * Delete a decision
   */
  async deleteDecision(id) {
    const response = await axiosInstance.delete(`/decisions/${id}`);
    return response.data;
  }

  /**
   * Export decisions
   */
  async exportDecisions(projectId, format = "json") {
    const response = await axiosInstance.get(
      `/projects/${projectId}/decisions/export`,
      {
        params: { format },
      }
    );
    return response.data;
  }

  /**
   * Get decision statistics
   */
  async getDecisionStats(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/decisions/statistics`
    );
    return response.data;
  }

  // ========== Risk Endpoints ==========

  /**
   * Get all risks for a project
   */
  async getRisks(projectId, params = {}) {
    const response = await axiosInstance.get(`/projects/${projectId}/risks`, {
      params,
    });
    return response.data;
  }

  /**
   * Create a new risk
   */
  async createRisk(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/risks`,
      data
    );
    return response.data;
  }

  /**
   * Get a risk by ID
   */
  async getRisk(id) {
    const response = await axiosInstance.get(`/risks/${id}`);
    return response.data;
  }

  /**
   * Update a risk
   */
  async updateRisk(id, data) {
    const response = await axiosInstance.put(`/risks/${id}`, data);
    return response.data;
  }

  /**
   * Delete a risk
   */
  async deleteRisk(id) {
    const response = await axiosInstance.delete(`/risks/${id}`);
    return response.data;
  }

  /**
   * Update risk status
   */
  async updateRiskStatus(id, data) {
    const response = await axiosInstance.patch(`/risks/${id}/status`, data);
    return response.data;
  }

  /**
   * Get risks by status
   */
  async getRisksByStatus(projectId, status) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/risks/status/${status}`
    );
    return response.data;
  }

  /**
   * Generate risk report
   */
  async getRiskReport(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/risks/report`
    );
    return response.data;
  }

  /**
   * Get project risk score
   */
  async getRiskScore(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/risks/score`
    );
    return response.data;
  }

  /**
   * Get risk matrix
   */
  async getRiskMatrix(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/risks/matrix`
    );
    return response.data;
  }
}

export const decisionsRisksService = new DecisionsRisksService();
export default decisionsRisksService;
