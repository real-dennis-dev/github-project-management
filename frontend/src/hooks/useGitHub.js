// src/components/github-integration/useGitHub.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import gitHubService from "../services/GitHubService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
} from "../components/github-integration/GitHubConstants";

/**
 * Custom hook for GitHub integration
 */
export const useGitHub = () => {
  const { projectId, repositoryId } = useParams();
  const navigate = useNavigate();

  // State
  const [repositories, setRepositories] = useState([]);
  const [repository, setRepository] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [syncing, setSyncing] = useState(false);

  /**
   * Fetch all repositories for the project
   */
  const fetchRepositories = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await gitHubService.getRepositories(projectId);
      if (response.success) {
        setRepositories(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch repositories");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching repositories");
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * Fetch a single repository by ID
   */
  const fetchRepository = useCallback(async () => {
    if (!repositoryId) return;

    setLoading(true);
    setError(null);

    try {
      // Find repository in the list if available, otherwise fetch it
      const existing = repositories.find((r) => r.id === repositoryId);
      if (existing) {
        setRepository(existing);
        setLoading(false);
        return;
      }

      // If not in list, we need to fetch it individually
      // For now, we'll refetch the list
      await fetchRepositories();
      const found = repositories.find((r) => r.id === repositoryId);
      if (found) {
        setRepository(found);
      } else {
        setError("Repository not found");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch repository");
    } finally {
      setLoading(false);
    }
  }, [repositoryId, repositories, fetchRepositories]);

  /**
   * Fetch commits for a repository
   */
  const fetchCommits = useCallback(async () => {
    if (!repositoryId) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await gitHubService.getCommits(repositoryId, params);

      if (response.success) {
        setCommits(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          }));
        }
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch commits");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching commits");
      setCommits([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [repositoryId, filters, pagination.page, pagination.limit]);

  /**
   * Fetch branches for a repository
   */
  const fetchBranches = useCallback(async () => {
    if (!repositoryId) return;

    try {
      const response = await gitHubService.getBranches(repositoryId);
      if (response.success) {
        setBranches(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  }, [repositoryId]);

  /**
   * Fetch pull requests for a repository
   */
  const fetchPullRequests = useCallback(async () => {
    if (!repositoryId) return;

    try {
      const params = {
        state: filters.state || "all",
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await gitHubService.getPullRequests(
        repositoryId,
        params
      );

      if (response.success) {
        setPullRequests(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch pull requests:", err);
    }
  }, [repositoryId, filters.state, pagination.page, pagination.limit]);

  /**
   * Fetch issues for a repository
   */
  const fetchIssues = useCallback(async () => {
    if (!repositoryId) return;

    try {
      const params = {
        state: filters.state || "all",
        page: pagination.page,
        limit: pagination.limit,
        labels: filters.labels || "",
      };

      const response = await gitHubService.getIssues(repositoryId, params);

      if (response.success) {
        setIssues(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch issues:", err);
    }
  }, [
    repositoryId,
    filters.state,
    filters.labels,
    pagination.page,
    pagination.limit,
  ]);

  /**
   * Fetch repository statistics
   */
  const fetchStats = useCallback(async () => {
    if (!repositoryId) return;

    try {
      const response = await gitHubService.getRepositoryStats(repositoryId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [repositoryId]);

  /**
   * Connect a new repository
   */
  const connectRepository = useCallback(
    async (data) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await gitHubService.connectRepository(projectId, data);

        if (response.success) {
          await fetchRepositories();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to connect repository");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while connecting the repository"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchRepositories]
  );

  /**
   * Disconnect a repository
   */
  const disconnectRepository = useCallback(
    async (repoId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await gitHubService.disconnectRepository(repoId);

        if (response.success) {
          await fetchRepositories();
          if (repoId === repositoryId) {
            navigate("/github/repositories");
          }
          return true;
        } else {
          throw new Error(
            response.message || "Failed to disconnect repository"
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while disconnecting the repository"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRepositories, repositoryId, navigate]
  );

  /**
   * Sync a repository
   */
  const syncRepository = useCallback(
    async (accessToken = null) => {
      if (!repositoryId) {
        throw new Error("Repository ID is required");
      }

      setSyncing(true);
      setError(null);

      try {
        const response = await gitHubService.syncRepository(
          repositoryId,
          accessToken
        );

        if (response.success) {
          // Refresh all data after sync
          await Promise.all([
            fetchRepository(),
            fetchCommits(),
            fetchBranches(),
            fetchPullRequests(),
            fetchIssues(),
            fetchStats(),
          ]);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to sync repository");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while syncing the repository"
        );
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [
      repositoryId,
      fetchRepository,
      fetchCommits,
      fetchBranches,
      fetchPullRequests,
      fetchIssues,
      fetchStats,
    ]
  );

  /**
   * Setup webhook for a repository
   */
  const setupWebhook = useCallback(
    async (config) => {
      if (!repositoryId) {
        throw new Error("Repository ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await gitHubService.setupWebhook(repositoryId, config);

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || "Failed to setup webhook");
        }
      } catch (err) {
        setError(err.message || "An error occurred while setting up webhook");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repositoryId]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Change limit
   */
  const changeLimit = useCallback((limit) => {
    setPagination({ page: 1, limit });
  }, []);

  /**
   * Navigate to repository detail
   */
  const navigateToRepository = useCallback(
    (repoId) => {
      navigate(`/github/repositories/${repoId}`);
    },
    [navigate]
  );

  /**
   * Navigate to repository stats
   */
  const navigateToStats = useCallback(
    (repoId) => {
      navigate(`/github/repositories/${repoId}/stats`);
    },
    [navigate]
  );

  /**
   * Navigate to webhook settings
   */
  const navigateToWebhook = useCallback(
    (repoId) => {
      navigate(`/github/repositories/${repoId}/webhook`);
    },
    [navigate]
  );

  /**
   * Navigate to connect repository
   */
  const navigateToConnect = useCallback(() => {
    navigate("/github/repositories/connect");
  }, [navigate]);

  /**
   * Navigate back to repositories list
   */
  const navigateToRepositories = useCallback(() => {
    navigate("/github/repositories");
  }, [navigate]);

  // Memoized computed values
  const totalCommits = useMemo(() => {
    return commits.length;
  }, [commits]);

  const totalBranches = useMemo(() => {
    return branches.length;
  }, [branches]);

  const openPullRequests = useMemo(() => {
    return pullRequests.filter((pr) => pr.state === "open").length;
  }, [pullRequests]);

  const openIssues = useMemo(() => {
    return issues.filter((issue) => issue.state === "open").length;
  }, [issues]);

  const hasRepositories = repositories.length > 0;

  // Auto-fetch on dependency changes
  useEffect(() => {
    if (projectId) {
      fetchRepositories();
    }
  }, [projectId, fetchRepositories]);

  useEffect(() => {
    if (repositoryId) {
      fetchRepository();
      fetchCommits();
      fetchBranches();
      fetchPullRequests();
      fetchIssues();
      fetchStats();
    }
  }, [
    repositoryId,
    fetchRepository,
    fetchCommits,
    fetchBranches,
    fetchPullRequests,
    fetchIssues,
    fetchStats,
  ]);

  return {
    // State
    repositories,
    repository,
    commits,
    branches,
    pullRequests,
    issues,
    stats,
    loading,
    error,
    syncing,
    pagination,
    filters,

    // Computed
    totalCommits,
    totalBranches,
    openPullRequests,
    openIssues,
    hasRepositories,

    // Fetch functions
    fetchRepositories,
    fetchRepository,
    fetchCommits,
    fetchBranches,
    fetchPullRequests,
    fetchIssues,
    fetchStats,

    // CRUD operations
    connectRepository,
    disconnectRepository,
    syncRepository,
    setupWebhook,

    // Filter and pagination
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,

    // Navigation
    navigateToRepository,
    navigateToStats,
    navigateToWebhook,
    navigateToConnect,
    navigateToRepositories,

    // IDs
    projectId,
    repositoryId,
  };
};

export default useGitHub;
