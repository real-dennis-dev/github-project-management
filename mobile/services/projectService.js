import api from "./apiService";
import API_CONFIG from "../config/apiConfig";
import storageService from "./storageService";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * Project Service
 * Handles all project-related API calls
 */
const projectService = {
  /**
   * Get all projects with filters
   * @param {Object} params - Filter parameters
   * @param {string} params.status - Project status
   * @param {string} params.priority - Project priority
   * @param {string} params.search - Search query
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    try {
      // Try to get from cache first
      const cacheKey = `${STORAGE_KEYS.PROJECTS_CACHE}_${JSON.stringify(
        params
      )}`;
      const cachedData = await storageService.getItem(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const response = await api.get(
        API_CONFIG.endpoints.projects.getAll,
        params
      );

      // Cache the response
      await storageService.setItem(cacheKey, response, { ttl: 300 }); // 5 minutes TTL

      return response;
    } catch (error) {
      console.error("Get all projects error:", error);
      throw error;
    }
  },

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.projects.getById(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get project by ID error:", error);
      throw error;
    }
  },

  /**
   * Create new project
   * @param {Object} data - Project data
   * @param {string} data.name - Project name
   * @param {string} data.description - Project description
   * @param {string} data.status - Project status
   * @param {string} data.priority - Project priority
   * @param {string} data.startDate - Start date
   * @param {string} data.endDate - End date
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const response = await api.post(
        API_CONFIG.endpoints.projects.create,
        data
      );

      // Invalidate cache
      await storageService.removeItem(STORAGE_KEYS.PROJECTS_CACHE);

      return response;
    } catch (error) {
      console.error("Create project error:", error);
      throw error;
    }
  },

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.projects.update(id);
      const response = await api.put(endpoint, data);

      // Invalidate cache
      await storageService.removeItem(STORAGE_KEYS.PROJECTS_CACHE);

      return response;
    } catch (error) {
      console.error("Update project error:", error);
      throw error;
    }
  },

  /**
   * Update project status
   * @param {string} id - Project ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    try {
      const endpoint = API_CONFIG.endpoints.projects.status(id);
      const response = await api.patch(endpoint, { status });

      // Invalidate cache
      await storageService.removeItem(STORAGE_KEYS.PROJECTS_CACHE);

      return response;
    } catch (error) {
      console.error("Update project status error:", error);
      throw error;
    }
  },

  /**
   * Delete project
   * @param {string} id - Project ID
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.projects.delete(id);
      await api.delete(endpoint);

      // Invalidate cache
      await storageService.removeItem(STORAGE_KEYS.PROJECTS_CACHE);

      return true;
    } catch (error) {
      console.error("Delete project error:", error);
      throw error;
    }
  },

  /**
   * Get project analytics
   * @param {string} id - Project ID
   * @returns {Promise<Object>}
   */
  getAnalytics: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.projects.analytics(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get project analytics error:", error);
      throw error;
    }
  },

  /**
   * Get project statistics
   * @param {string} id - Project ID
   * @returns {Promise<Object>}
   */
  getStatistics: async (id) => {
    try {
      const analytics = await projectService.getAnalytics(id);
      return analytics.data;
    } catch (error) {
      console.error("Get project statistics error:", error);
      throw error;
    }
  },

  /**
   * Get project timeline
   * @param {string} id - Project ID
   * @param {Object} params - Timeline parameters
   * @param {string} params.fromDate - Start date
   * @param {string} params.toDate - End date
   * @returns {Promise<Object>}
   */
  getTimeline: async (id, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.timeline(id);
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get project timeline error:", error);
      throw error;
    }
  },

  /**
   * Get project progress overview
   * @param {string} id - Project ID
   * @returns {Promise<Object>}
   */
  getProgressOverview: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.overview(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get project progress overview error:", error);
      throw error;
    }
  },

  /**
   * Add timeline entry
   * @param {string} id - Project ID
   * @param {Object} data - Timeline entry data
   * @param {string} data.date - Date
   * @param {number} data.progress - Progress percentage
   * @param {string} data.notes - Notes
   * @returns {Promise<Object>}
   */
  addTimelineEntry: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.progress.addEntry(id);
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
   * Get project expenses
   * @param {string} id - Project ID
   * @param {Object} params - Filter parameters
   * @param {string} params.category - Expense category
   * @param {string} params.fromDate - Start date
   * @param {string} params.toDate - End date
   * @returns {Promise<Object>}
   */
  getExpenses: async (id, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.expenses.getByProject(id);
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get project expenses error:", error);
      throw error;
    }
  },

  /**
   * Create expense for project
   * @param {string} id - Project ID
   * @param {Object} data - Expense data
   * @returns {Promise<Object>}
   */
  createExpense: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.expenses.create(id);
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Create expense error:", error);
      throw error;
    }
  },

  /**
   * Update expense
   * @param {string} expenseId - Expense ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  updateExpense: async (expenseId, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.expenses.update(expenseId);
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update expense error:", error);
      throw error;
    }
  },

  /**
   * Delete expense
   * @param {string} expenseId - Expense ID
   * @returns {Promise<boolean>}
   */
  deleteExpense: async (expenseId) => {
    try {
      const endpoint = API_CONFIG.endpoints.expenses.delete(expenseId);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete expense error:", error);
      throw error;
    }
  },

  /**
   * Get expense summary
   * @param {string} id - Project ID
   * @returns {Promise<Object>}
   */
  getExpenseSummary: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.expenses.summary(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get expense summary error:", error);
      throw error;
    }
  },
};

export default projectService;
