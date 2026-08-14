import api from "./apiService";
import API_CONFIG from "../config/apiConfig";

/**
 * Knowledge Base Service
 * Handles knowledge base entries
 */
const knowledgeBaseService = {
  /**
   * Get knowledge entries
   * @param {Object} params - Filter parameters
   * @param {string} params.category - Category
   * @param {string} params.search - Search query
   * @param {Array} params.tags - Tags to filter
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.getAll;
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get knowledge entries error:", error);
      throw error;
    }
  },

  /**
   * Get knowledge entry by ID
   * @param {string} id - Entry ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.getById(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get knowledge entry error:", error);
      throw error;
    }
  },

  /**
   * Create knowledge entry
   * @param {Object} data - Entry data
   * @param {string} data.title - Entry title
   * @param {string} data.content - Entry content (markdown)
   * @param {string} data.category - Category
   * @param {Array} data.tags - Tags
   * @param {Array} data.relatedEntries - Related entry IDs
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.create;
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Create knowledge entry error:", error);
      throw error;
    }
  },

  /**
   * Update knowledge entry
   * @param {string} id - Entry ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.update(id);
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update knowledge entry error:", error);
      throw error;
    }
  },

  /**
   * Delete knowledge entry
   * @param {string} id - Entry ID
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.delete(id);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete knowledge entry error:", error);
      throw error;
    }
  },

  /**
   * Search knowledge base
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @param {string} params.category - Category filter
   * @param {Array} params.tags - Tags filter
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>}
   */
  search: async (query, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.search;
      const response = await api.get(endpoint, { q: query, ...params });
      return response;
    } catch (error) {
      console.error("Search knowledge base error:", error);
      throw error;
    }
  },

  /**
   * Get categories
   * @returns {Promise<Array>}
   */
  getCategories: async () => {
    try {
      const endpoint = API_CONFIG.endpoints.knowledge.categories;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get categories error:", error);
      throw error;
    }
  },

  /**
   * Get related entries
   * @param {string} entryId - Entry ID
   * @param {number} limit - Maximum number of related entries
   * @returns {Promise<Array>}
   */
  getRelatedEntries: async (entryId, limit = 5) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.knowledge.related?.(entryId) ||
        `/knowledge-base/${entryId}/related`;
      const response = await api.get(endpoint, { limit });
      return response;
    } catch (error) {
      console.error("Get related entries error:", error);
      throw error;
    }
  },

  /**
   * Get knowledge base statistics
   * @returns {Promise<Object>}
   */
  getStatistics: async () => {
    try {
      const response = await knowledgeBaseService.getAll({ limit: 0 });
      const entries = response.data || [];

      const stats = {
        total: entries.length,
        byCategory: {},
        totalTags: 0,
        averageViews: 0,
        popularEntries: [],
        recentlyUpdated: [],
      };

      let totalViews = 0;

      entries.forEach((entry) => {
        stats.byCategory[entry.category] =
          (stats.byCategory[entry.category] || 0) + 1;
        stats.totalTags += (entry.tags || []).length;
        totalViews += entry.views || 0;
      });

      stats.averageViews =
        entries.length > 0 ? Math.round(totalViews / entries.length) : 0;

      // Sort by views for popular entries
      stats.popularEntries = [...entries]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      // Sort by updated date
      stats.recentlyUpdated = [...entries]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

      return stats;
    } catch (error) {
      console.error("Get knowledge base statistics error:", error);
      throw error;
    }
  },

  /**
   * Increment entry views
   * @param {string} id - Entry ID
   * @returns {Promise<boolean>}
   */
  incrementViews: async (id) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.knowledge.view?.(id) ||
        `/knowledge-base/${id}/view`;
      await api.patch(endpoint);
      return true;
    } catch (error) {
      console.error("Increment entry views error:", error);
      return false;
    }
  },
};

export default knowledgeBaseService;
