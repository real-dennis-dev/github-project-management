// src/services/githubService.js
import axiosInstance from "./axiosInstance";

class GithubService {
  constructor() {
    this.basePath = "/api";
  }

  // Repository endpoints
  async getRepositories(projectId) {
    const response = await axiosInstance.get(
      `${this.basePath}/projects/${projectId}/repositories`
    );
    return response.data;
  }

  async connectRepository(projectId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/projects/${projectId}/repositories`,
      data
    );
    return response.data;
  }

  async disconnectRepository(repositoryId) {
    const response = await axiosInstance.delete(
      `${this.basePath}/repositories/${repositoryId}`
    );
    return response.data;
  }

  async syncRepository(repositoryId, data = {}) {
    const response = await axiosInstance.post(
      `${this.basePath}/repositories/${repositoryId}/sync`,
      data
    );
    return response.data;
  }

  // Commit endpoints
  async getCommits(repositoryId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/repositories/${repositoryId}/commits`,
      { params }
    );
    return response.data;
  }

  // Branch endpoints
  async getBranches(repositoryId) {
    const response = await axiosInstance.get(
      `${this.basePath}/repositories/${repositoryId}/branches`
    );
    return response.data;
  }

  // Pull Request endpoints
  async getPullRequests(repositoryId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/repositories/${repositoryId}/pull-requests`,
      { params }
    );
    return response.data;
  }

  // Issue endpoints
  async getIssues(repositoryId, params = {}) {
    const response = await axiosInstance.get(
      `${this.basePath}/repositories/${repositoryId}/issues`,
      { params }
    );
    return response.data;
  }

  // Webhook endpoints
  async setupWebhook(repositoryId, data) {
    const response = await axiosInstance.post(
      `${this.basePath}/repositories/${repositoryId}/webhook`,
      data
    );
    return response.data;
  }

  // Statistics endpoints
  async getRepositoryStats(repositoryId) {
    const response = await axiosInstance.get(
      `${this.basePath}/repositories/${repositoryId}/stats`
    );
    return response.data;
  }
}

export const githubService = new GithubService();
export default githubService;
