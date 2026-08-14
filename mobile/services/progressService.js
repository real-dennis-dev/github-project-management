import api from "./apiService";
import API_CONFIG from "../config/apiConfig";

/**
 * Progress Service
 * Handles project progress and timeline tracking
 */
const progressService = {
  /**
   * Get project timeline
   * @param {string} projectId - Project ID
   * @param {Object} params - Filter parameters
   * @param {string} params.fromDate - Start date
   * @param {string} params.toDate - End date
   * @param {string} params.interval - daily/weekly/monthly
   * @returns {Promise<Object>}
   */
  getTimeline: async (projectId, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.timeline(projectId);
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get timeline error:", error);
      throw error;
    }
  },

  /**
   * Add timeline entry
   * @param {string} projectId - Project ID
   * @param {Object} data - Timeline entry data
   * @param {string} data.date - Date
   * @param {number} data.progress - Progress percentage (0-100)
   * @param {string} data.notes - Notes
   * @param {Array} data.milestones - Milestones achieved
   * @returns {Promise<Object>}
   */
  addTimelineEntry: async (projectId, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.addEntry(projectId);
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Add timeline entry error:", error);
      throw error;
    }
  },

  /**
   * Update timeline entry
   * @param {string} entryId - Entry ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  updateTimelineEntry: async (entryId, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.updateEntry(entryId);
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update timeline entry error:", error);
      throw error;
    }
  },

  /**
   * Delete timeline entry
   * @param {string} entryId - Entry ID
   * @returns {Promise<boolean>}
   */
  deleteTimelineEntry: async (entryId) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.deleteEntry(entryId);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete timeline entry error:", error);
      throw error;
    }
  },

  /**
   * Get progress overview
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  getProgressOverview: async (projectId) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.overview(projectId);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get progress overview error:", error);
      throw error;
    }
  },

  /**
   * Calculate monthly progress
   * @param {string} projectId - Project ID
   * @param {string} month - Month (YYYY-MM)
   * @returns {Promise<Object>}
   */
  calculateMonthlyProgress: async (projectId, month) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.progress.monthly?.(projectId) ||
        `/projects/${projectId}/progress/monthly`;
      const response = await api.get(endpoint, { month });
      return response;
    } catch (error) {
      console.error("Calculate monthly progress error:", error);
      throw error;
    }
  },

  /**
   * Generate progress report
   * @param {string} projectId - Project ID
   * @param {Object} params - Report parameters
   * @param {string} params.fromDate - Start date
   * @param {string} params.toDate - End date
   * @param {string} params.format - pdf/csv/excel
   * @returns {Promise<Object>}
   */
  generateProgressReport: async (projectId, params = {}) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.progress.report?.(projectId) ||
        `/projects/${projectId}/progress/report`;
      const response = await api.post(endpoint, params);
      return response;
    } catch (error) {
      console.error("Generate progress report error:", error);
      throw error;
    }
  },

  /**
   * Get progress trends
   * @param {string} projectId - Project ID
   * @param {Object} params - Trend parameters
   * @param {number} params.period - Number of months to analyze
   * @returns {Promise<Object>}
   */
  getProgressTrends: async (projectId, params = { period: 6 }) => {
    try {
      const response = await progressService.getTimeline(projectId, {
        fromDate: new Date(
          new Date().setMonth(new Date().getMonth() - params.period)
        ),
        toDate: new Date(),
        interval: "monthly",
      });

      const entries = response.data || [];

      const trends = {
        dates: [],
        progress: [],
        velocity: [],
        averageProgress: 0,
        totalProgress: 0,
      };

      let previousProgress = 0;
      let totalProgress = 0;

      entries.forEach((entry, index) => {
        trends.dates.push(entry.date);
        trends.progress.push(entry.progress);

        const velocity = index > 0 ? entry.progress - previousProgress : 0;
        trends.velocity.push(velocity);

        totalProgress += entry.progress;
        previousProgress = entry.progress;
      });

      trends.averageProgress =
        entries.length > 0 ? totalProgress / entries.length : 0;
      trends.totalProgress =
        entries.length > 0 ? entries[entries.length - 1]?.progress || 0 : 0;

      return trends;
    } catch (error) {
      console.error("Get progress trends error:", error);
      throw error;
    }
  },

  /**
   * Get milestone progress
   * @param {string} projectId - Project ID
   * @param {string} milestoneId - Milestone ID
   * @returns {Promise<Object>}
   */
  getMilestoneProgress: async (projectId, milestoneId) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.milestones.getById?.(milestoneId) ||
        `/milestones/${milestoneId}`;
      const response = await api.get(endpoint);

      const milestone = response.data;
      const progress = {
        id: milestone.id,
        title: milestone.title,
        progress: milestone.progress || 0,
        targetDate: milestone.targetDate,
        status: milestone.status,
        isOverdue: milestone.targetDate
          ? new Date() > new Date(milestone.targetDate)
          : false,
        daysRemaining: milestone.targetDate
          ? Math.ceil(
              (new Date(milestone.targetDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      };

      return progress;
    } catch (error) {
      console.error("Get milestone progress error:", error);
      throw error;
    }
  },

  /**
   * Get release progress
   * @param {string} projectId - Project ID
   * @param {string} releaseId - Release ID
   * @returns {Promise<Object>}
   */
  getReleaseProgress: async (projectId, releaseId) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.releases.getById?.(releaseId) ||
        `/releases/${releaseId}`;
      const response = await api.get(endpoint);

      const release = response.data;
      const progress = {
        id: release.id,
        version: release.version,
        title: release.title,
        progress: release.progress || 0,
        releaseDate: release.releaseDate,
        status: release.status,
        features: release.features || [],
        totalFeatures: release.totalFeatures || 0,
        completedFeatures: release.completedFeatures || 0,
        isReady: release.status === "ready",
      };

      return progress;
    } catch (error) {
      console.error("Get release progress error:", error);
      throw error;
    }
  },
};

export default progressService;
