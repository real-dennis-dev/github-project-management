// src/services/documentationKnowledgeService.js
import axiosInstance from "./axiosInstance";

class DocumentationKnowledgeService {
  // ============ Documentation Endpoints ============

  async getDocumentation(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/documentation`,
      { params }
    );
    return response.data;
  }

  async getDocumentationById(id) {
    const response = await axiosInstance.get(`/documentation/${id}`);
    return response.data;
  }

  async createDocumentation(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/documentation`,
      data
    );
    return response.data;
  }

  async updateDocumentation(id, data) {
    const response = await axiosInstance.put(`/documentation/${id}`, data);
    return response.data;
  }

  async deleteDocumentation(id) {
    const response = await axiosInstance.delete(`/documentation/${id}`);
    return response.data;
  }

  async searchDocumentation(projectId, params) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/documentation/search`,
      { params }
    );
    return response.data;
  }

  // ============ Knowledge Base Endpoints ============

  async getKnowledgeEntries(params = {}) {
    const response = await axiosInstance.get(`/knowledge-base`, { params });
    return response.data;
  }

  async getKnowledgeById(id) {
    const response = await axiosInstance.get(`/knowledge-base/${id}`);
    return response.data;
  }

  async createKnowledgeEntry(data) {
    const response = await axiosInstance.post(`/knowledge-base`, data);
    return response.data;
  }

  async updateKnowledgeEntry(id, data) {
    const response = await axiosInstance.put(`/knowledge-base/${id}`, data);
    return response.data;
  }

  async deleteKnowledgeEntry(id) {
    const response = await axiosInstance.delete(`/knowledge-base/${id}`);
    return response.data;
  }

  async searchKnowledge(params) {
    const response = await axiosInstance.get(`/knowledge-base/search`, {
      params,
    });
    return response.data;
  }

  async getCategories() {
    const response = await axiosInstance.get(`/knowledge-base/categories`);
    return response.data;
  }

  // ============ Dashboard Endpoint ============

  async getDashboardStats(params = {}) {
    const response = await axiosInstance.get(`/documentation-knowledge/stats`, {
      params,
    });
    return response.data;
  }
}

export const documentationKnowledgeService =
  new DocumentationKnowledgeService();
export default documentationKnowledgeService;
