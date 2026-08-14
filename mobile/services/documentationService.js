import api from "./apiService";
import API_CONFIG from "../config/apiConfig";

/**
 * Documentation Service
 * Handles project documentation and knowledge base
 */
const documentationService = {
  /**
   * Get project documentation
   * @param {string} projectId - Project ID
   * @param {string} type - Documentation type (technical/functional/user)
   * @returns {Promise<Object>}
   */
  getByProject: async (projectId, type = null) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.documentation.getByProject(projectId);
      const response = await api.get(endpoint, { type });
      return response;
    } catch (error) {
      console.error("Get project documentation error:", error);
      throw error;
    }
  },

  /**
   * Get documentation by ID
   * @param {string} id - Documentation ID
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.documentation.getById(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get documentation by ID error:", error);
      throw error;
    }
  },

  /**
   * Create documentation
   * @param {string} projectId - Project ID
   * @param {Object} data - Documentation data
   * @param {string} data.title - Documentation title
   * @param {string} data.content - Documentation content (markdown)
   * @param {string} data.type - Documentation type
   * @param {Array} data.tags - Tags
   * @param {string} data.category - Category
   * @returns {Promise<Object>}
   */
  create: async (projectId, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.documentation.create(projectId);
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error("Create documentation error:", error);
      throw error;
    }
  },

  /**
   * Update documentation
   * @param {string} id - Documentation ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    try {
      const endpoint = API_CONFIG.endpoints.documentation.update(id);
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error("Update documentation error:", error);
      throw error;
    }
  },

  /**
   * Delete documentation
   * @param {string} id - Documentation ID
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.documentation.delete(id);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Delete documentation error:", error);
      throw error;
    }
  },

  /**
   * Search documentation
   * @param {string} projectId - Project ID
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @param {string} params.type - Documentation type
   * @param {Array} params.tags - Tags to filter
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>}
   */
  search: async (projectId, query, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.documentation.search(projectId);
      const response = await api.get(endpoint, { q: query, ...params });
      return response;
    } catch (error) {
      console.error("Search documentation error:", error);
      throw error;
    }
  },

  /**
   * Get documentation versions
   * @param {string} id - Documentation ID
   * @returns {Promise<Array>}
   */
  getVersions: async (id) => {
    try {
      const endpoint = API_CONFIG.endpoints.documentation.versions(id);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get documentation versions error:", error);
      throw error;
    }
  },

  /**
   * Get documentation statistics
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  getStatistics: async (projectId) => {
    try {
      const response = await documentationService.getByProject(projectId);
      const docs = response.data || [];

      const stats = {
        total: docs.length,
        byType: {},
        byCategory: {},
        totalWords: 0,
        averageLength: 0,
        lastUpdated: null,
      };

      let totalWords = 0;

      docs.forEach((doc) => {
        stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
        stats.byCategory[doc.category] =
          (stats.byCategory[doc.category] || 0) + 1;

        const wordCount = doc.content ? doc.content.split(/\s+/).length : 0;
        totalWords += wordCount;

        if (
          !stats.lastUpdated ||
          new Date(doc.updatedAt) > new Date(stats.lastUpdated)
        ) {
          stats.lastUpdated = doc.updatedAt;
        }
      });

      stats.totalWords = totalWords;
      stats.averageLength =
        docs.length > 0 ? Math.round(totalWords / docs.length) : 0;

      return stats;
    } catch (error) {
      console.error("Get documentation statistics error:", error);
      throw error;
    }
  },

  /**
   * Export documentation
   * @param {string} projectId - Project ID
   * @param {Array} docIds - Documentation IDs to export
   * @param {string} format - Export format (pdf/markdown/html)
   * @returns {Promise<Object>}
   */
  export: async (projectId, docIds, format = "pdf") => {
    try {
      const endpoint =
        API_CONFIG.endpoints.documentation.export?.(projectId) ||
        `/projects/${projectId}/documentation/export`;
      const response = await api.post(endpoint, { docIds, format });
      return response;
    } catch (error) {
      console.error("Export documentation error:", error);
      throw error;
    }
  },
};

export default documentationService;
