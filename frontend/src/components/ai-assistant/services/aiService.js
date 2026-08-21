// src/components/ai-assistant/services/aiService.js
import axiosInstance from "../../../services/axiosInstance";

// Base path for AI endpoints
const AI_BASE = "/ai";

/**
 * AI Service - Handles all AI Assistant API calls
 */
export const aiService = {
  /**
   * Get AI assistant status
   */
  getStatus: async (signal) => {
    const response = await axiosInstance.get(`${AI_BASE}/status`, { signal });
    return response.data;
  },

  /**
   * Ask AI a question about the project
   */
  askQuestion: async (projectId, question, context = {}, signal) => {
    const response = await axiosInstance.post(
      `/projects/${projectId}${AI_BASE}/ask`,
      { question, context },
      { signal }
    );
    return response.data;
  },

  /**
   * Analyze the project
   */
  analyzeProject: async (projectId, options = {}, signal) => {
    const response = await axiosInstance.post(
      `/projects/${projectId}${AI_BASE}/analyze`,
      options,
      { signal }
    );
    return response.data;
  },

  /**
   * Generate a report
   */
  generateReport: async (projectId, options = {}, signal) => {
    const response = await axiosInstance.post(
      `/projects/${projectId}${AI_BASE}/report`,
      options,
      { signal }
    );
    return response.data;
  },

  /**
   * Get project trends
   */
  getTrends: async (projectId, signal) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}${AI_BASE}/trends`,
      { signal }
    );
    return response.data;
  },

  /**
   * Get suggested next actions
   */
  getNextActions: async (projectId, signal) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}${AI_BASE}/actions`,
      { signal }
    );
    return response.data;
  },

  /**
   * Get conversation history
   */
  getConversations: async (projectId, params = {}, signal) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}${AI_BASE}/conversations`,
      { params, signal }
    );
    return response.data;
  },

  /**
   * Get a specific conversation
   */
  getConversation: async (conversationId, signal) => {
    const response = await axiosInstance.get(
      `${AI_BASE}/conversations/${conversationId}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Summarize text
   */
  summarizeText: async (text, options = {}, signal) => {
    const response = await axiosInstance.post(
      `${AI_BASE}/summarize`,
      { text, ...options },
      { signal }
    );
    return response.data;
  },

  /**
   * Cancel ongoing request
   */
  cancelRequest: (abortController) => {
    if (abortController) {
      abortController.abort();
    }
  },
};

export default aiService;
