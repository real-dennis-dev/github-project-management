import { useState, useEffect, useCallback } from "react";
import githubIntegrationService from "../services/github-integration.service";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook for GitHub Integration
 * Provides state management and actions for GitHub operations
 */
export const useGitHubIntegration = (projectId) => {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  /**
   * Fetch all repositories for the project
   */
  const fetchRepositories = useCallback(async () => {
    if (!projectId || !user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await githubIntegrationService.getRepositories(
        projectId
      );

      if (response.success) {
        setRepositories(response.data.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch repositories");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching repositories:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  /**
   * Connect a repository
   */
  const connectRepository = useCallback(
    async (data) => {
      if (!projectId || !user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.connectRepository(
          projectId,
          data
        );

        if (response.success) {
          // Refresh repository list
          await fetchRepositories();
          return response.data;
        } else {
          throw new Error(response.error || "Failed to connect repository");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, user, fetchRepositories]
  );

  /**
   * Disconnect a repository
   */
  const disconnectRepository = useCallback(
    async (repositoryId) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.disconnectRepository(
          repositoryId
        );

        if (response.success) {
          // Refresh repository list
          await fetchRepositories();
          return response.data;
        } else {
          throw new Error(response.error || "Failed to disconnect repository");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchRepositories]
  );

  /**
   * Sync a repository
   */
  const syncRepository = useCallback(
    async (repositoryId, accessToken = null) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.syncRepository(
          repositoryId,
          accessToken
        );

        if (response.success) {
          // Refresh repository list
          await fetchRepositories();
          return response.data;
        } else {
          throw new Error(response.error || "Failed to sync repository");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, fetchRepositories]
  );

  /**
   * Fetch commits for a repository
   */
  const fetchCommits = useCallback(
    async (repositoryId, filters = {}) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.getCommits(
          repositoryId,
          {
            ...filters,
            page: filters.page || pagination.page,
            limit: filters.limit || pagination.limit,
          }
        );

        if (response.success) {
          setCommits(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
          return response;
        } else {
          throw new Error(response.error || "Failed to fetch commits");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, pagination.page, pagination.limit]
  );

  /**
   * Fetch branches for a repository
   */
  const fetchBranches = useCallback(
    async (repositoryId) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.getBranches(
          repositoryId
        );

        if (response.success) {
          setBranches(response.data || []);
          return response;
        } else {
          throw new Error(response.error || "Failed to fetch branches");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Fetch pull requests for a repository
   */
  const fetchPullRequests = useCallback(
    async (repositoryId, filters = {}) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.getPullRequests(
          repositoryId,
          {
            ...filters,
            page: filters.page || pagination.page,
            limit: filters.limit || pagination.limit,
          }
        );

        if (response.success) {
          setPullRequests(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
          return response;
        } else {
          throw new Error(response.error || "Failed to fetch pull requests");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, pagination.page, pagination.limit]
  );

  /**
   * Fetch issues for a repository
   */
  const fetchIssues = useCallback(
    async (repositoryId, filters = {}) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.getIssues(
          repositoryId,
          {
            ...filters,
            page: filters.page || pagination.page,
            limit: filters.limit || pagination.limit,
          }
        );

        if (response.success) {
          setIssues(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
          return response;
        } else {
          throw new Error(response.error || "Failed to fetch issues");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, pagination.page, pagination.limit]
  );

  /**
   * Fetch repository statistics
   */
  const fetchRepositoryStats = useCallback(
    async (repositoryId) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.getRepositoryStats(
          repositoryId
        );

        if (response.success) {
          setStats(response.data);
          return response;
        } else {
          throw new Error(response.error || "Failed to fetch repository stats");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Set up webhook for repository
   */
  const setupWebhook = useCallback(
    async (repositoryId, config) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await githubIntegrationService.setupWebhook(
          repositoryId,
          config
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.error || "Failed to setup webhook");
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Select a repository and fetch its data
  const selectRepository = useCallback(
    async (repositoryId) => {
      if (!repositoryId) {
        setSelectedRepo(null);
        setCommits([]);
        setBranches([]);
        setPullRequests([]);
        setIssues([]);
        setStats(null);
        return;
      }

      setSelectedRepo(repositoryId);

      // Fetch all data in parallel
      await Promise.all([
        fetchCommits(repositoryId),
        fetchBranches(repositoryId),
        fetchPullRequests(repositoryId),
        fetchIssues(repositoryId),
        fetchRepositoryStats(repositoryId),
      ]);
    },
    [
      fetchCommits,
      fetchBranches,
      fetchPullRequests,
      fetchIssues,
      fetchRepositoryStats,
    ]
  );

  // Load repositories on mount
  useEffect(() => {
    if (projectId && user) {
      fetchRepositories();
    }
  }, [projectId, user, fetchRepositories]);

  return {
    // State
    repositories,
    loading,
    error,
    selectedRepo,
    commits,
    branches,
    pullRequests,
    issues,
    stats,
    pagination,

    // Actions
    fetchRepositories,
    connectRepository,
    disconnectRepository,
    syncRepository,
    fetchCommits,
    fetchBranches,
    fetchPullRequests,
    fetchIssues,
    fetchRepositoryStats,
    setupWebhook,
    selectRepository,

    // Pagination control
    setPagination,
  };
};

export default useGitHubIntegration;
