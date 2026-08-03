// src/components/github-integration/GitHubService.js

import axiosInstance from "./axiosInstance";

/**
 * GitHub Integration Service
 * Handles all GitHub API calls to the backend
 */
class GitHubService {
  /**
   * Get all repositories for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - List of repositories
   */
  async getRepositories(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/repositories`
    );
    return response.data;
  }

  /**
   * Connect a GitHub repository
   * @param {string} projectId - Project UUID
   * @param {Object} data - Repository data
   * @param {string} data.repoUrl - GitHub repository URL
   * @param {string} data.defaultBranch - Default branch name
   * @param {string} data.accessToken - GitHub personal access token
   * @returns {Promise<Object>} - Connected repository
   */
  async connectRepository(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/repositories`,
      data
    );
    return response.data;
  }

  /**
   * Disconnect a GitHub repository
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} - Success response
   */
  async disconnectRepository(repositoryId) {
    const response = await axiosInstance.delete(
      `/repositories/${repositoryId}`
    );
    return response.data;
  }

  /**
   * Sync a GitHub repository
   * @param {string} repositoryId - Repository UUID
   * @param {string} accessToken - GitHub personal access token (optional)
   * @returns {Promise<Object>} - Sync results
   */
  async syncRepository(repositoryId, accessToken = null) {
    const data = accessToken ? { accessToken } : {};
    const response = await axiosInstance.post(
      `/repositories/${repositoryId}/sync`,
      data
    );
    return response.data;
  }

  /**
   * Get commits from a repository
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - Query filters
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.branch - Branch name
   * @param {string} filters.since - Start date (ISO format)
   * @param {string} filters.until - End date (ISO format)
   * @param {string} filters.author - Author name/email
   * @param {string} filters.search - Search term in commit message
   * @returns {Promise<Object>} - List of commits
   */
  async getCommits(repositoryId, filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `/repositories/${repositoryId}/commits${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Get branches from a repository
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} - List of branches
   */
  async getBranches(repositoryId) {
    const response = await axiosInstance.get(
      `/repositories/${repositoryId}/branches`
    );
    return response.data;
  }

  /**
   * Get pull requests from a repository
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - Query filters
   * @param {string} filters.state - PR state (open, closed, merged, all)
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.since - Start date (ISO format)
   * @param {string} filters.until - End date (ISO format)
   * @param {string} filters.author - Author username
   * @returns {Promise<Object>} - List of pull requests
   */
  async getPullRequests(repositoryId, filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `/repositories/${repositoryId}/pull-requests${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Get issues from a repository
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - Query filters
   * @param {string} filters.state - Issue state (open, closed, all)
   * @param {string} filters.labels - Labels (comma separated)
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.since - Start date (ISO format)
   * @param {string} filters.until - End date (ISO format)
   * @param {string} filters.author - Author username
   * @returns {Promise<Object>} - List of issues
   */
  async getIssues(repositoryId, filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `/repositories/${repositoryId}/issues${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Setup GitHub webhook
   * @param {string} repositoryId - Repository UUID
   * @param {Object} config - Webhook configuration
   * @param {string} config.webhookUrl - Webhook endpoint URL
   * @param {Array<string>} config.events - Events to subscribe to
   * @param {boolean} config.active - Whether webhook is active
   * @param {string} config.contentType - Content type (json, form)
   * @returns {Promise<Object>} - Webhook setup result
   */
  async setupWebhook(repositoryId, config) {
    const response = await axiosInstance.post(
      `/repositories/${repositoryId}/webhook`,
      config
    );
    return response.data;
  }

  /**
   * Get repository statistics
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} - Repository statistics
   */
  async getRepositoryStats(repositoryId) {
    const response = await axiosInstance.get(
      `/repositories/${repositoryId}/stats`
    );
    return response.data;
  }
}

// Create and export a singleton instance
const gitHubService = new GitHubService();
export default gitHubService;
