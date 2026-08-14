import api from "./apiService";
import API_CONFIG from "../config/apiConfig";
import GITHUB_CONFIG from "../config/githubConfig";
import * as AuthSession from "expo-auth-session";

/**
 * GitHub Service
 * Handles GitHub integration
 */
const githubService = {
  /**
   * Get authentication URL
   * @returns {string} GitHub OAuth URL
   */
  getAuthUrl: () => {
    const config = {
      clientId: GITHUB_CONFIG.clientId,
      scopes: GITHUB_CONFIG.scopes,
      redirectUri: GITHUB_CONFIG.redirectUri,
    };

    const authUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${config.clientId}&` +
      `scope=${encodeURIComponent(config.scopes)}&` +
      `redirect_uri=${encodeURIComponent(config.redirectUri)}`;

    return authUrl;
  },

  /**
   * Exchange code for access token
   * @param {string} code - OAuth authorization code
   * @returns {Promise<Object>}
   */
  getAccessToken: async (code) => {
    try {
      const response = await api.post("/github/oauth/token", { code });
      return response.data;
    } catch (error) {
      console.error("Get GitHub access token error:", error);
      throw error;
    }
  },

  /**
   * Get user repositories
   * @param {string} token - GitHub access token
   * @param {Object} params - Filter parameters
   * @param {string} params.visibility - Repository visibility (public/private)
   * @param {string} params.sort - Sort field
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Array>}
   */
  getUserRepos: async (token, params = {}) => {
    try {
      const response = await api.get("/github/user/repos", params, {
        Authorization: `Bearer ${token}`,
      });
      return response.data;
    } catch (error) {
      console.error("Get user repositories error:", error);
      throw error;
    }
  },

  /**
   * Get repositories for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>}
   */
  getRepositories: async (projectId) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.getRepositories(projectId);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get repositories error:", error);
      throw error;
    }
  },

  /**
   * Connect repository to project
   * @param {string} projectId - Project ID
   * @param {Object} repoData - Repository data
   * @param {string} repoData.name - Repository name
   * @param {string} repoData.owner - Repository owner
   * @param {string} repoData.url - Repository URL
   * @param {string} repoData.branch - Default branch
   * @returns {Promise<Object>}
   */
  connectRepository: async (projectId, repoData) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.connect(projectId);
      const response = await api.post(endpoint, repoData);
      return response;
    } catch (error) {
      console.error("Connect repository error:", error);
      throw error;
    }
  },

  /**
   * Disconnect repository
   * @param {string} repositoryId - Repository ID
   * @returns {Promise<boolean>}
   */
  disconnectRepository: async (repositoryId) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.disconnect(repositoryId);
      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error("Disconnect repository error:", error);
      throw error;
    }
  },

  /**
   * Sync repository
   * @param {string} repositoryId - Repository ID
   * @returns {Promise<Object>}
   */
  syncRepository: async (repositoryId) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.sync(repositoryId);
      const response = await api.post(endpoint);
      return response;
    } catch (error) {
      console.error("Sync repository error:", error);
      throw error;
    }
  },

  /**
   * Get commits from repository
   * @param {string} repositoryId - Repository ID
   * @param {Object} params - Filter parameters
   * @param {string} params.branch - Branch name
   * @param {string} params.from - From date
   * @param {string} params.to - To date
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>}
   */
  getCommits: async (repositoryId, params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.commits(repositoryId);
      const response = await api.get(endpoint, params);
      return response;
    } catch (error) {
      console.error("Get commits error:", error);
      throw error;
    }
  },

  /**
   * Get branches from repository
   * @param {string} repositoryId - Repository ID
   * @returns {Promise<Array>}
   */
  getBranches: async (repositoryId) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.branches(repositoryId);
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error("Get branches error:", error);
      throw error;
    }
  },

  /**
   * Get pull requests from repository
   * @param {string} repositoryId - Repository ID
   * @param {string} state - PR state (open/closed/all)
   * @param {Object} params - Additional parameters
   * @returns {Promise<Array>}
   */
  getPullRequests: async (repositoryId, state = "open", params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.pullRequests(repositoryId);
      const response = await api.get(endpoint, { state, ...params });
      return response;
    } catch (error) {
      console.error("Get pull requests error:", error);
      throw error;
    }
  },

  /**
   * Get issues from repository
   * @param {string} repositoryId - Repository ID
   * @param {string} state - Issue state (open/closed/all)
   * @param {Object} params - Additional parameters
   * @returns {Promise<Array>}
   */
  getIssues: async (repositoryId, state = "open", params = {}) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.issues(repositoryId);
      const response = await api.get(endpoint, { state, ...params });
      return response;
    } catch (error) {
      console.error("Get issues error:", error);
      throw error;
    }
  },

  /**
   * Setup webhook for repository
   * @param {string} repositoryId - Repository ID
   * @param {Object} config - Webhook configuration
   * @param {string} config.url - Webhook URL
   * @param {Array<string>} config.events - Events to listen to
   * @param {boolean} config.active - Active status
   * @returns {Promise<Object>}
   */
  setupWebhook: async (repositoryId, config) => {
    try {
      const endpoint = API_CONFIG.endpoints.github.webhook(repositoryId);
      const response = await api.post(endpoint, config);
      return response;
    } catch (error) {
      console.error("Setup webhook error:", error);
      throw error;
    }
  },

  /**
   * Process webhook payload
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {Promise<Object>}
   */
  processWebhook: async (payload, signature) => {
    try {
      const response = await api.post("/github/webhook", payload, {
        "X-Hub-Signature": signature,
      });
      return response;
    } catch (error) {
      console.error("Process webhook error:", error);
      throw error;
    }
  },

  /**
   * Get repository statistics
   * @param {string} repositoryId - Repository ID
   * @param {string} branch - Branch name
   * @returns {Promise<Object>}
   */
  getStatistics: async (repositoryId, branch = "main") => {
    try {
      const commits = await githubService.getCommits(repositoryId, { branch });
      const branches = await githubService.getBranches(repositoryId);
      const prs = await githubService.getPullRequests(repositoryId, "all");

      const stats = {
        totalCommits: commits.data?.length || 0,
        totalBranches: branches.data?.length || 0,
        openPRs: 0,
        closedPRs: 0,
        averageCommitFrequency: 0,
        contributors: new Set(),
      };

      // Calculate PR stats
      if (prs.data) {
        prs.data.forEach((pr) => {
          if (pr.state === "open") stats.openPRs++;
          else if (pr.state === "closed") stats.closedPRs++;
        });
      }

      // Get contributors from commits
      if (commits.data) {
        commits.data.forEach((commit) => {
          if (commit.author && commit.author.username) {
            stats.contributors.add(commit.author.username);
          }
        });
      }

      stats.totalContributors = stats.contributors.size;

      return stats;
    } catch (error) {
      console.error("Get repository statistics error:", error);
      throw error;
    }
  },

  /**
   * Get commit statistics by author
   * @param {string} repositoryId - Repository ID
   * @param {string} branch - Branch name
   * @returns {Promise<Object>}
   */
  getCommitStats: async (repositoryId, branch = "main") => {
    try {
      const response = await githubService.getCommits(repositoryId, { branch });
      const commits = response.data || [];

      const stats = {};
      commits.forEach((commit) => {
        const author = commit.author?.username || "unknown";
        if (!stats[author]) {
          stats[author] = {
            total: 0,
            additions: 0,
            deletions: 0,
            files: 0,
          };
        }
        stats[author].total++;
        stats[author].additions += commit.additions || 0;
        stats[author].deletions += commit.deletions || 0;
        stats[author].files += commit.files || 0;
      });

      return stats;
    } catch (error) {
      console.error("Get commit stats error:", error);
      throw error;
    }
  },

  /**
   * Get repository content
   * @param {string} repositoryId - Repository ID
   * @param {string} path - File path
   * @param {string} ref - Branch/tag/commit reference
   * @returns {Promise<Object>}
   */
  getContent: async (repositoryId, path, ref) => {
    try {
      const endpoint =
        API_CONFIG.endpoints.github.content?.(repositoryId) ||
        `/github/repositories/${repositoryId}/content`;
      const response = await api.get(endpoint, { path, ref });
      return response;
    } catch (error) {
      console.error("Get repository content error:", error);
      throw error;
    }
  },
};

export default githubService;
