// src/services/decisionRisksDashboardService.js
import axiosInstance from "./axiosInstance";

class DecisionRisksDashboardService {
  /**
   * Get global decisions and risks dashboard statistics across all projects
   * @param {Object} params - Query parameters
   * @param {string} params.decisionImpact - Filter decisions by impact
   * @param {string} params.riskLevel - Filter risks by level
   * @param {string} params.riskStatus - Filter risks by status
   * @param {string} params.fromDate - Filter from date (ISO format)
   * @param {string} params.toDate - Filter to date (ISO format)
   * @param {number} params.months - Number of months for trend data
   * @param {number} params.page - Page number for items
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(params = {}) {
    const response = await axiosInstance.get(`/decisions-risks/stats`, {
      params,
    });
    return response.data;
  }
}

export const decisionRisksDashboardService =
  new DecisionRisksDashboardService();
export default decisionRisksDashboardService;
