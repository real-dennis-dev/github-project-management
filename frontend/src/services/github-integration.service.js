import axiosInstance from "./axiosInstance";

/**
 * GitHub Integration Service
 * Handles all GitHub API calls to the backend
 */
class GitHubIntegrationService {
  /**
   * Get all repositories for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - List of repositories
   */
  async getRepositories(projectId) {
    try {
      const response = await axiosInstance.get(
        `/projects/${projectId}/repositories`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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
    try {
      const response = await axiosInstance.post(
        `/projects/${projectId}/repositories`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Disconnect a GitHub repository
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} - Success response
   */
  async disconnectRepository(repositoryId) {
    try {
      const response = await axiosInstance.delete(
        `/repositories/${repositoryId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync a GitHub repository
   * @param {string} repositoryId - Repository UUID
   * @param {string} accessToken - GitHub personal access token (optional)
   * @returns {Promise<Object>} - Sync results
   */
  async syncRepository(repositoryId, accessToken = null) {
    try {
      const data = accessToken ? { accessToken } : {};
      const response = await axiosInstance.post(
        `/repositories/${repositoryId}/sync`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get commits from a repository
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - Query filters
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.branch - Branch name
   * @param {string} filters.fromDate - Start date
   * @param {string} filters.toDate - End date
   * @param {string} filters.author - Author name
   * @returns {Promise<Object>} - List of commits
   */
  async getCommits(repositoryId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `/repositories/${repositoryId}/commits${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get branches from a repository
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} - List of branches
   */
  async getBranches(repositoryId) {
    try {
      const response = await axiosInstance.get(
        `/repositories/${repositoryId}/branches`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pull requests from a repository
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - Query filters
   * @param {string} filters.state - PR state (open, closed, merged, all)
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} - List of pull requests
   */
  async getPullRequests(repositoryId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `/repositories/${repositoryId}/pull-requests${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get issues from a repository
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - Query filters
   * @param {string} filters.state - Issue state (open, closed, all)
   * @param {string} filters.labels - Labels (comma separated)
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} - List of issues
   */
  async getIssues(repositoryId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `/repositories/${repositoryId}/issues${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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
    try {
      const response = await axiosInstance.post(
        `/repositories/${repositoryId}/webhook`,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get repository statistics
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} - Repository statistics
   */
  async getRepositoryStats(repositoryId) {
    try {
      const response = await axiosInstance.get(
        `/repositories/${repositoryId}/stats`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object from axios
   * @returns {Error} - Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        "An error occurred";
      const status = error.response.status;

      if (status === 401) {
        // Dispatch logout event if not already handled
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      return new Error(message);
    } else if (error.request) {
      // Request was made but no response
      return new Error("Network error - please check your connection");
    } else {
      // Something else happened
      return new Error(error.message || "An unexpected error occurred");
    }
  }
}

// Create and export a singleton instance
const githubIntegrationService = new GitHubIntegrationService();
export default githubIntegrationService;
