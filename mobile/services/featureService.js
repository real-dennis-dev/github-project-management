import api from "./apiService";
import API_CONFIG from "../config/apiConfig";

/**
 * Feature Service
 * Handles all feature-related API calls
 */
const featureService = {
  /**
   * Get features by project
   * @param {string} projectId - Project ID
   * @param {Object} params - Filter parameters
   * @param {string} params.status - Feature status
   * @param {string} params.search - Search query
   * @param {string} params.sort - Sort field
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>}
   */
  getByProject: async (projectId, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.getByProject(projectId);
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get features by project error:", error);
      throw error;
    }
  },

  /**
   * Get feature by ID
   * @param {string} id - Feature ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.getById(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get feature by ID error:", error);
      throw error;
    }
  },

  /**
   * Create new feature
   * @param {string} projectId - Project ID
   * @param {Object} data - Feature data
   * @param {string} data.title - Feature title
   * @param {string} data.description - Feature description
   * @param {string} data.status - Feature status
   * @param {number} data.storyPoints - Story points
   * @param {string} data.assignedTo - Assigned user ID
   * @returns {Promise<Object>}
   */
  create: async (projectId, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.create(projectId);
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Create feature error:", error);
      throw error;
    }
  },

  /**
   * Update feature
   * @param {string} id - Feature ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.update(id);
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update feature error:", error);
      throw error;
    }
  },

  /**
   * Update feature status
   * @param {string} id - Feature ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.status(id);
      const response = await api.patch(endpoint, { status });
      return response;
    } catch (error) {
      console.error("Update feature status error:", error);
      throw error;
    }
  },

  /**
   * Delete feature
   * @param {string} id - Feature ID
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.delete(id);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete feature error:", error);
      throw error;
    }
  },

  /**
   * Reorder features
   * @param {string} projectId - Project ID
   * @param {Array<string>} orderedIds - Ordered feature IDs
   * @returns {Promise<boolean>}
   */
  reorder: async (projectId, orderedIds) => {
    try {
      const endpoint = API_CONFIG.endpoints.features.reorder(projectId);
      await api.post(endpoint, { orderedIds });
      return true;
    } catch (error) {
      console.error("Reorder features error:", error);
      throw error;
    }
  },

  /**
   * Get feature subtasks
   * @param {string} featureId - Feature ID
   * @returns {Promise<Object>}
   */
  getSubtasks: async (featureId) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.features.getSubtasks?.(featureId) ||
        `/features/${featureId}/subtasks`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get feature subtasks error:", error);
      throw error;
    }
  },

  /**
   * Create subtask
   * @param {string} featureId - Feature ID
   * @param {Object} data - Subtask data
   * @param {string} data.title - Subtask title
   * @param {boolean} data.isComplete - Completion status
   * @returns {Promise<Object>}
   */
  createSubtask: async (featureId, data) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.features.createSubtask?.(featureId) ||
        `/features/${featureId}/subtasks`;
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Create subtask error:", error);
      throw error;
    }
  },

  /**
   * Update subtask
   * @param {string} subtaskId - Subtask ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  updateSubtask: async (subtaskId, data) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.features.updateSubtask?.(subtaskId) ||
        `/subtasks/${subtaskId}`;
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update subtask error:", error);
      throw error;
    }
  },

  /**
   * Toggle subtask completion
   * @param {string} subtaskId - Subtask ID
   * @param {boolean} isComplete - Completion status
   * @returns {Promise<Object>}
   */
  toggleSubtask: async (subtaskId, isComplete) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.features.toggleSubtask?.(subtaskId) ||
        `/subtasks/${subtaskId}/toggle`;
      const response = await api.patch(endpoint, { isComplete });
      return response;
    } catch (error) {
      console.error("Toggle subtask error:", error);
      throw error;
    }
  },

  /**
   * Delete subtask
   * @param {string} subtaskId - Subtask ID
   * @returns {Promise<boolean>}
   */
  deleteSubtask: async (subtaskId) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.features.deleteSubtask?.(subtaskId) ||
        `/subtasks/${subtaskId}`;
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete subtask error:", error);
      throw error;
    }
  },

  /**
   * Get feature statistics
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  getStatistics: async (projectId) => {
    try {
      const response = await featureService.getByProject(projectId);
      const features = response.data || [];

      const stats = {
        total: features.length,
        byStatus: {},
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        inProgress: 0,
        backlog: 0,
      };

      features.forEach((feature) => {
        stats.byStatus[feature.status] =
          (stats.byStatus[feature.status] || 0) + 1;
        stats.totalStoryPoints += feature.storyPoints || 0;

        if (feature.status === "done") {
          stats.completedStoryPoints += feature.storyPoints || 0;
        }
        if (feature.status === "in_progress" || feature.status === "review") {
          stats.inProgress++;
        }
        if (feature.status === "backlog" || feature.status === "todo") {
          stats.backlog++;
        }
      });

      stats.completionRate =
        stats.totalStoryPoints > 0
          ? (stats.completedStoryPoints / stats.totalStoryPoints) * 100
          : 0;

      return stats;
    } catch (error) {
      console.error("Get feature statistics error:", error);
      throw error;
    }
  },
};

export default featureService;
