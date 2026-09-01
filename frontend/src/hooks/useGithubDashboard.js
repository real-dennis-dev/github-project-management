// src/hooks/useGithubDashboard.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGithubDashboardStore } from "../store/githubDashboardStore";
import githubDashboardService from "../services/githubDashboardService";

export const useGithubDashboard = () => {
  const queryClient = useQueryClient();
  const store = useGithubDashboardStore();

  const GITHUB_DASHBOARD_KEYS = {
    stats: (params) => ["githubDashboard", "stats", params],
  };

  // ============ Query ============

  const getStatsQuery = (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const queryParams = { page, limit };

    return useQuery({
      queryKey: GITHUB_DASHBOARD_KEYS.stats(queryParams),
      queryFn: () => githubDashboardService.getDashboardStats(queryParams),
      enabled: true,
      onSuccess: (response) => {
        if (response.success) {
          store.setStats(response.data);
          if (response.data?.activity) {
            store.setActivity(
              response.data.activity || [],
              response.data.pagination || {}
            );
          }
        }
      },
      onError: (error) => {
        store.setError(
          error.message || "Failed to fetch GitHub dashboard statistics"
        );
      },
    });
  };

  // ============ API Methods ============

  const getStats = (params = {}) => {
    store.clearError();
    store.setLoading(true);
    return getStatsQuery(params);
  };

  const refetch = () => {
    store.clearError();
    queryClient.invalidateQueries({ queryKey: ["githubDashboard"] });
    return queryClient.refetchQueries({ queryKey: ["githubDashboard"] });
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    stats: store.stats,
    activity: store.activity,
    pagination: store.pagination,
    isLoading: store.isLoading,
    error: store.error,
    generatedAt: store.generatedAt,
    filters: store.filters,

    // Query
    getStats,
    refetch,

    // Query status
    isFetching: getStatsQuery({}).isFetching,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useGithubDashboard;
