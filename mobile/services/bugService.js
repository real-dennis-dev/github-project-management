import api from "./apiService";
import API_CONFIG from "../config/apiConfig";

/**
 * Bug Service
 * Handles all bug-related API calls
 */
const bugService = {
  /**
   * Get bugs by project
   * @param {string} projectId - Project ID
   * @param {Object} params - Filter parameters
   * @param {string} params.status - Bug status
   * @param {string} params.priority - Bug priority
   * @param {string} params.assignedTo - Assigned user ID
   * @param {string} params.search - Search query
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>}
   */
  getByProject: async (projectId, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.getByProject(projectId);
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get bugs by project error:", error);
      throw error;
    }
  },

  /**
   * Get bug by ID
   * @param {string} id - Bug ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.getById(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get bug by ID error:", error);
      throw error;
    }
  },

  /**
   * Create new bug
   * @param {string} projectId - Project ID
   * @param {Object} data - Bug data
   * @param {string} data.title - Bug title
   * @param {string} data.description - Bug description
   * @param {string} data.priority - Bug priority
   * @param {string} data.assignedTo - Assigned user ID
   * @returns {Promise<Object>}
   */
  create: async (projectId, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.create(projectId);
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Create bug error:", error);
      throw error;
    }
  },

  /**
   * Update bug
   * @param {string} id - Bug ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.update(id);
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update bug error:", error);
      throw error;
    }
  },

  /**
   * Update bug status
   * @param {string} id - Bug ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.status(id);
      const response = await api.patch(endpoint, { status });
      return response;
    } catch (error) {
      console.error("Update bug status error:", error);
      throw error;
    }
  },

  /**
   * Assign bug to user
   * @param {string} id - Bug ID
   * @param {string} assigneeId - User ID to assign
   * @returns {Promise<Object>}
   */
  assign: async (id, assigneeId) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.assign(id);
      const response = await api.patch(endpoint, { assigneeId });
      return response;
    } catch (error) {
      console.error("Assign bug error:", error);
      throw error;
    }
  },

  /**
   * Delete bug
   * @param {string} id - Bug ID
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.bugs.delete(id);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete bug error:", error);
      throw error;
    }
  },

  /**
   * Resolve bug
   * @param {string} id - Bug ID
   * @param {string} resolution - Resolution notes
   * @returns {Promise<Object>}
   */
  resolve: async (id, resolution) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.bugs.resolve?.(id) || `/bugs/${id}/resolve`;
      const response = await api.patch(endpoint, { resolution });
      return response;
    } catch (error) {
      console.error("Resolve bug error:", error);
      throw error;
    }
  },

  /**
   * Reopen bug
   * @param {string} id - Bug ID
   * @param {string} reason - Reopen reason
   * @returns {Promise<Object>}
   */
  reopen: async (id, reason) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.bugs.reopen?.(id) || `/bugs/${id}/reopen`;
      const response = await api.patch(endpoint, { reason });
      return response;
    } catch (error) {
      console.error("Reopen bug error:", error);
      throw error;
    }
  },

  /**
   * Get bug statistics
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  getStatistics: async (projectId) => {
    try {
      const response = await bugService.getByProject(projectId);
      const bugs = response.data || [];

      const stats = {
        total: bugs.length,
        byStatus: {},
        byPriority: {},
        open: 0,
        inProgress: 0,
        closed: 0,
        averageResolutionTime: 0,
      };

      let totalResolutionTime = 0;
      let resolvedBugsCount = 0;

      bugs.forEach((bug) => {
        stats.byStatus[bug.status] = (stats.byStatus[bug.status] || 0) + 1;
        stats.byPriority[bug.priority] =
          (stats.byPriority[bug.priority] || 0) + 1;

        if (
          bug.status === "open" ||
          bug.status === "new" ||
          bug.status === "reopened"
        ) {
          stats.open++;
        } else if (bug.status === "in_progress") {
          stats.inProgress++;
        } else if (bug.status === "closed" || bug.status === "verified") {
          stats.closed++;
        }

        // Calculate resolution time
        if (bug.resolvedAt && bug.createdAt) {
          const created = new Date(bug.createdAt);
          const resolved = new Date(bug.resolvedAt);
          const diffHours = (resolved - created) / (1000 * 60 * 60);
          totalResolutionTime += diffHours;
          resolvedBugsCount++;
        }
      });

      stats.averageResolutionTime =
        resolvedBugsCount > 0 ? totalResolutionTime / resolvedBugsCount : 0;

      stats.resolutionRate =
        stats.total > 0 ? (stats.closed / stats.total) * 100 : 0;

      return stats;
    } catch (error) {
      console.error("Get bug statistics error:", error);
      throw error;
    }
  },

  /**
   * Get bug priorities
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  getPriorities: async (projectId) => {
    try {
      const response = await bugService.getByProject(projectId);
      const bugs = response.data || [];

      const priorities = {
        critical: [],
        high: [],
        medium: [],
        low: [],
      };

      bugs.forEach((bug) => {
        if (priorities[bug.priority]) {
          priorities[bug.priority].push(bug);
        }
      });

      return priorities;
    } catch (error) {
      console.error("Get bug priorities error:", error);
      throw error;
    }
  },
};

export default bugService;
