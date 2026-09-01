// src/hooks/useAIDashboard.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAIDashboardStore } from "../store/aiDashboardStore";
import aiDashboardService from "../services/aiDashboardService";

export const useAIDashboard = () => {
  const queryClient = useQueryClient();
  const store = useAIDashboardStore();

  const AI_DASHBOARD_KEYS = {
    stats: (params) => ["aiDashboard", "stats", params],
  };

  // ============ Query ============

  const getStatsQuery = (params = {}) => {
    return useQuery({
      queryKey: AI_DASHBOARD_KEYS.stats(params),
      queryFn: () => aiDashboardService.getGlobalAIStats(params),
      enabled: true,
      staleTime: 1000 * 60, // 1 minute
      onSuccess: (response) => {
        if (response.success) {
          store.setStats(response.data);
          if (response.data?.activities) {
            store.setActivities(
              response.data.activities || [],
              response.data.pagination || {}
            );
          }
        }
      },
      onError: (error) => {
        store.setError(
          error.message || "Failed to fetch AI dashboard statistics"
        );
      },
    });
  };

  // ============ API Methods ============

  const getStats = (params = {}) => {
    store.clearError();
    store.setLoading(true);
    const query = getStatsQuery(params);
    // We'll use the query's isLoading state
    return query;
  };

  const refetch = () => {
    store.clearError();
    queryClient.invalidateQueries({ queryKey: ["aiDashboard"] });
    return queryClient.refetchQueries({ queryKey: ["aiDashboard"] });
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    stats: store.stats,
    activities: store.activities,
    pagination: store.pagination,
    isLoading: store.isLoading,
    error: store.error,
    filters: store.filters,

    // Query
    getStats,
    refetch,

    // Query status (from the latest query)
    isFetching: getStatsQuery({}).isFetching,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useAIDashboard;
