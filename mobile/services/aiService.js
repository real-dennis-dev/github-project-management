import api from "./apiService";
import API_CONFIG from "../config/apiConfig";
import storageService from "./storageService";

/**
 * AI Service
 * Handles AI assistant functionality
 */
const aiService = {
  /**
   * Ask AI a question with project context
   * @param {string} projectId - Project ID
   * @param {string} question - User question
   * @param {Object} context - Additional context
   * @param {Array} context.messages - Previous conversation messages
   * @param {string} context.focus - Focus area (project/features/bugs/risks)
   * @returns {Promise<Object>}
   */
  askQuestion: async (projectId, question, context = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.ai.ask(projectId);
      const response = await api.post(endpoint, {
        question,
        context: {
          messages: context.messages || [],
          focus: context.focus || "general",
        },
      });

      // Cache the conversation
      await aiService.saveConversation(projectId, question, response.data);

      return response;
    } catch (error) {
      console.error("Ask AI question error:", error);
      throw error;
    }
  },

  /**
   * Analyze project
   * @param {string} projectId - Project ID
   * @param {Object} options - Analysis options
   * @param {Array} options.areas - Areas to analyze
   * @param {boolean} options.deepAnalysis - Deep analysis flag
   * @returns {Promise<Object>}
   */
  analyzeProject: async (projectId, options = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.ai.analyze(projectId);
      const response = await api.post(endpoint, {
        areas: options.areas || ["progress", "risks", "tech_debt"],
        deepAnalysis: options.deepAnalysis || false,
      });
      return response;
    } catch (error) {
      console.error("Analyze project error:", error);
      throw error;
    }
  },

  /**
   * Get AI conversations
   * @param {string} projectId - Project ID
   * @param {Object} params - Filter parameters
   * @param {number} params.limit - Number of conversations
   * @param {number} params.page - Page number
   * @returns {Promise<Object>}
   */
  getConversations: async (projectId, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.ai.conversations(projectId);
      const response = await api.get(endpoint, {
        limit: params.limit || 20,
        page: params.page || 1,
      });
      return response;
    } catch (error) {
      console.error("Get conversations error:", error);
      throw error;
    }
  },

  /**
   * Get conversation by ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>}
   */
  getConversation: async (conversationId) => {
    try {
      const endpoint = API_CONFIG.endpoints.ai.getConversation(conversationId);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get conversation error:", error);
      throw error;
    }
  },

  /**
   * Summarize text
   * @param {string} text - Text to summarize
   * @param {number} maxLength - Maximum summary length
   * @param {string} format - Summary format (bullet/paragraph)
   * @returns {Promise<Object>}
   */
  summarizeText: async (text, maxLength = 200, format = "paragraph") => {
    try {
      const endpoint = API_CONFIG.endpoints.ai.summarize;
      const response = await api.post(endpoint, {
        text,
        maxLength,
        format,
      });
      return response;
    } catch (error) {
      console.error("Summarize text error:", error);
      throw error;
    }
  },

  /**
   * Generate report
   * @param {string} projectId - Project ID
   * @param {string} type - Report type (status/progress/risk/technical)
   * @param {Object} options - Report options
   * @param {string} options.dateRange - Date range
   * @param {Array} options.sections - Sections to include
   * @param {string} options.format - Report format (markdown/html)
   * @returns {Promise<Object>}
   */
  generateReport: async (projectId, type = "status", options = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.ai.generateReport;
      const response = await api.post(endpoint, {
        projectId,
        type,
        options: {
          dateRange: options.dateRange || "last_month",
          sections: options.sections || [
            "overview",
            "progress",
            "risks",
            "recommendations",
          ],
          format: options.format || "markdown",
        },
      });
      return response;
    } catch (error) {
      console.error("Generate report error:", error);
      throw error;
    }
  },

  /**
   * Suggest next actions
   * @param {string} projectId - Project ID
   * @param {Object} options - Suggestion options
   * @param {number} options.count - Number of suggestions
   * @param {Array} options.focusAreas - Focus areas
   * @returns {Promise<Object>}
   */
  suggestNextActions: async (projectId, options = {}) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.ai.suggest?.(projectId) ||
        `/projects/${projectId}/ai/suggest`;
      const response = await api.post(endpoint, {
        count: options.count || 5,
        focusAreas: options.focusAreas || ["all"],
      });
      return response;
    } catch (error) {
      console.error("Suggest next actions error:", error);
      throw error;
    }
  },

  /**
   * Analyze trends
   * @param {string} projectId - Project ID
   * @param {Array} dataPoints - Data points to analyze
   * @returns {Promise<Object>}
   */
  analyzeTrends: async (projectId, dataPoints) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.ai.trends?.(projectId) ||
        `/projects/${projectId}/ai/trends`;
      const response = await api.post(endpoint, {
        dataPoints: dataPoints || ["progress", "velocity", "bug_rate"],
      });
      return response;
    } catch (error) {
      console.error("Analyze trends error:", error);
      throw error;
    }
  },

  /**
   * Save conversation to local cache
   * @param {string} projectId - Project ID
   * @param {string} question - User question
   * @param {Object} response - AI response
   * @returns {Promise<void>}
   */
  saveConversation: async (projectId, question, response) => {
    try {
      const key = `@ai_conversation_${projectId}`;
      const existing = (await storageService.getItem(key)) || [];
      const newEntry = {
        id: Date.now().toString(),
        question,
        response,
        timestamp: new Date().toISOString(),
      };

      // Keep last 50 conversations
      const conversations = [newEntry, ...existing].slice(0, 50);
      await storageService.setItem(key, conversations);
    } catch (error) {
      console.error("Save conversation error:", error);
    }
  },

  /**
   * Get cached conversations
   * @param {string} projectId - Project ID
   * @param {number} limit - Number of conversations
   * @returns {Promise<Array>}
   */
  getCachedConversations: async (projectId, limit = 10) => {
    try {
      const key = `@ai_conversation_${projectId}`;
      const conversations = (await storageService.getItem(key)) || [];
      return conversations.slice(0, limit);
    } catch (error) {
      console.error("Get cached conversations error:", error);
      return [];
    }
  },

  /**
   * Clear cached conversations
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  clearCachedConversations: async (projectId) => {
    try {
      const key = `@ai_conversation_${projectId}`;
      await storageService.removeItem(key);
    } catch (error) {
      console.error("Clear cached conversations error:", error);
    }
  },
};

export default aiService;
