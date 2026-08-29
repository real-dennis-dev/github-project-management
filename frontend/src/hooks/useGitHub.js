// src/hooks/useGithub.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGithubStore } from "../store/githubStore";
import githubService from "../services/githubService";
import {
  connectRepositorySchema,
  webhookSetupSchema,
  commitFilterSchema,
  pullRequestFilterSchema,
  issueFilterSchema,
  syncRequestSchema,
  validateForm,
} from "../utils/githubValidation";

export const useGithub = () => {
  const queryClient = useQueryClient();
  const store = useGithubStore();

  // Query Keys
  const GITHUB_KEYS = {
    repositories: (projectId) => ["github", "repositories", projectId],
    commits: (repositoryId, params) => [
      "github",
      "commits",
      repositoryId,
      params,
    ],
    branches: (repositoryId) => ["github", "branches", repositoryId],
    pullRequests: (repositoryId, params) => [
      "github",
      "pullRequests",
      repositoryId,
      params,
    ],
    issues: (repositoryId, params) => [
      "github",
      "issues",
      repositoryId,
      params,
    ],
    stats: (repositoryId) => ["github", "stats", repositoryId],
  };

  // ============ Queries ============

  // Get repositories query
  const getRepositoriesQuery = (projectId) => {
    return useQuery({
      queryKey: GITHUB_KEYS.repositories(projectId),
      queryFn: () => githubService.getRepositories(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setRepositories(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch repositories");
      },
    });
  };

  // Get commits query
  const getCommitsQuery = (repositoryId, params = {}) => {
    const validatedParams = commitFilterSchema.cast(params);
    return useQuery({
      queryKey: GITHUB_KEYS.commits(repositoryId, validatedParams),
      queryFn: () => githubService.getCommits(repositoryId, validatedParams),
      enabled: !!repositoryId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCommits(response.data, response.pagination);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch commits");
      },
    });
  };

  // Get branches query
  const getBranchesQuery = (repositoryId) => {
    return useQuery({
      queryKey: GITHUB_KEYS.branches(repositoryId),
      queryFn: () => githubService.getBranches(repositoryId),
      enabled: !!repositoryId,
      onSuccess: (response) => {
        if (response.success) {
          store.setBranches(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch branches");
      },
    });
  };

  // Get pull requests query
  const getPullRequestsQuery = (repositoryId, params = {}) => {
    const validatedParams = pullRequestFilterSchema.cast(params);
    return useQuery({
      queryKey: GITHUB_KEYS.pullRequests(repositoryId, validatedParams),
      queryFn: () =>
        githubService.getPullRequests(repositoryId, validatedParams),
      enabled: !!repositoryId,
      onSuccess: (response) => {
        if (response.success) {
          store.setPullRequests(response.data, response.pagination);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch pull requests");
      },
    });
  };

  // Get issues query
  const getIssuesQuery = (repositoryId, params = {}) => {
    const validatedParams = issueFilterSchema.cast(params);
    return useQuery({
      queryKey: GITHUB_KEYS.issues(repositoryId, validatedParams),
      queryFn: () => githubService.getIssues(repositoryId, validatedParams),
      enabled: !!repositoryId,
      onSuccess: (response) => {
        if (response.success) {
          store.setIssues(response.data, response.pagination);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch issues");
      },
    });
  };

  // Get repository stats query
  const getRepositoryStatsQuery = (repositoryId) => {
    return useQuery({
      queryKey: GITHUB_KEYS.stats(repositoryId),
      queryFn: () => githubService.getRepositoryStats(repositoryId),
      enabled: !!repositoryId,
      onSuccess: (response) => {
        if (response.success) {
          store.setRepositoryStats(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch repository stats");
      },
    });
  };

  // ============ Mutations ============

  // Connect repository mutation
  const connectRepositoryMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(connectRepositorySchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return githubService.connectRepository(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addRepository(response.data);
        queryClient.invalidateQueries({
          queryKey: ["github", "repositories"],
        });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to connect repository");
    },
  });

  // Disconnect repository mutation
  const disconnectRepositoryMutation = useMutation({
    mutationFn: (repositoryId) => {
      return githubService.disconnectRepository(repositoryId);
    },
    onSuccess: (response) => {
      if (response.success) {
        store.removeRepository(repositoryId);
        queryClient.invalidateQueries({
          queryKey: ["github", "repositories"],
        });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to disconnect repository");
    },
  });

  // Sync repository mutation
  const syncRepositoryMutation = useMutation({
    mutationFn: ({ repositoryId, data = {} }) => {
      return validateForm(syncRequestSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return githubService.syncRepository(repositoryId, data);
      });
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        store.setSyncStatus({
          isSyncing: false,
          lastSyncedAt: response.data?.lastSyncedAt || new Date().toISOString(),
        });
        // Invalidate all related queries
        queryClient.invalidateQueries({
          queryKey: ["github", "commits", variables.repositoryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["github", "branches", variables.repositoryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["github", "pullRequests", variables.repositoryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["github", "issues", variables.repositoryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["github", "stats", variables.repositoryId],
        });
        store.updateRepository(variables.repositoryId, {
          last_synced_at:
            response.data?.lastSyncedAt || new Date().toISOString(),
        });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setSyncStatus({ isSyncing: false });
      store.setError(message || "Failed to sync repository");
    },
  });

  // Setup webhook mutation
  const setupWebhookMutation = useMutation({
    mutationFn: ({ repositoryId, data }) => {
      return validateForm(webhookSetupSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return githubService.setupWebhook(repositoryId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.setWebhookConfig(response.data);
        store.setError(null);
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to setup webhook");
    },
  });

  // ============ API Methods ============

  const getRepositories = (projectId) => {
    return getRepositoriesQuery(projectId);
  };

  const connectRepository = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await connectRepositoryMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const disconnectRepository = async (repositoryId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await disconnectRepositoryMutation.mutateAsync(
        repositoryId
      );
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const syncRepository = async (repositoryId, data = {}) => {
    store.clearError();
    store.setSyncStatus({ isSyncing: true });
    try {
      const result = await syncRepositoryMutation.mutateAsync({
        repositoryId,
        data,
      });
      return result;
    } finally {
      store.setSyncStatus({ isSyncing: false });
    }
  };

  const getCommits = (repositoryId, params = {}) => {
    return getCommitsQuery(repositoryId, params);
  };

  const getBranches = (repositoryId) => {
    return getBranchesQuery(repositoryId);
  };

  const getPullRequests = (repositoryId, params = {}) => {
    return getPullRequestsQuery(repositoryId, params);
  };

  const getIssues = (repositoryId, params = {}) => {
    return getIssuesQuery(repositoryId, params);
  };

  const getRepositoryStats = (repositoryId) => {
    return getRepositoryStatsQuery(repositoryId);
  };

  const setupWebhook = async (repositoryId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await setupWebhookMutation.mutateAsync({
        repositoryId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearGithub = () => store.clearGithub();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);
  const setPagination = (pagination) => store.setPagination(pagination);

  return {
    // State from store
    repositories: store.repositories,
    currentRepository: store.currentRepository,
    commits: store.commits,
    branches: store.branches,
    pullRequests: store.pullRequests,
    issues: store.issues,
    repositoryStats: store.repositoryStats,
    webhookConfig: store.webhookConfig,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,
    syncStatus: store.syncStatus,

    // Query loading states
    isRepositoriesLoading: getRepositoriesQuery("").isLoading,
    isCommitsLoading: getCommitsQuery("").isLoading,
    isBranchesLoading: getBranchesQuery("").isLoading,
    isPullRequestsLoading: getPullRequestsQuery("").isLoading,
    isIssuesLoading: getIssuesQuery("").isLoading,
    isStatsLoading: getRepositoryStatsQuery("").isLoading,

    // Mutation loading states
    isConnecting: connectRepositoryMutation.isPending,
    isDisconnecting: disconnectRepositoryMutation.isPending,
    isSyncing: syncRepositoryMutation.isPending,
    isSettingWebhook: setupWebhookMutation.isPending,

    // Query methods
    getRepositories,
    getCommits,
    getBranches,
    getPullRequests,
    getIssues,
    getRepositoryStats,

    // Mutation methods
    connectRepository,
    disconnectRepository,
    syncRepository,
    setupWebhook,

    // Store actions
    clearError,
    clearGithub,
    reset,
    setFilters,
    setPagination,
  };
};

export default useGithub;
