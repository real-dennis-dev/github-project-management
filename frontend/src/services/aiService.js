// src/services/aiService.js
import axiosInstance from "./axiosInstance";

class AIService {
  constructor() {
    this.basePath = "/api";
  }

  // Ask AI a question about the project
  async askQuestion(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/ai/ask`,
      data
    );
    return response.data;
  }

  // Analyze the project and provide insights
  async analyzeProject(projectId, data = {}) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/ai/analyze`,
      data
    );
    return response.data;
  }

  // Get conversation history
  async getConversations(projectId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/ai/conversations`,
      { params }
    );
    return response.data;
  }

  // Get a specific conversation
  async getConversation(conversationId) {
    const response = await axiosInstance.get(
      `${this.basePath}/ai/conversations/${conversationId}`
    );
    return response.data;
  }

  // Summarize text
  async summarizeText(data) {
    const response = await axiosInstance.post(
      `${this.basePath}/ai/summarize`,
      data
    );
    return response.data;
  }

  // Generate an AI-powered report
  async generateReport(projectId, data = {}) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/ai/report`,
      data
    );
    return response.data;
  }

  // Get suggested next actions
  async getNextActions(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/ai/actions`
    );
    return response.data;
  }

  // Analyze project trends
  async getTrends(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/ai/trends`
    );
    return response.data;
  }

  // Get AI assistant status
  async getStatus() {
    const response = await axiosInstance.get(`${this.basePath}/ai/status`);
    return response.data;
  }
}

export const aiService = new AIService();
export default aiService;
