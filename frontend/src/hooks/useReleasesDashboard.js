// src/hooks/useReleasesDashboard.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useReleasesDashboardStore } from "../store/releasesDashboardStore";
import releasesDashboardService from "../services/releasesDashboardService";

export const useReleasesDashboard = () => {
  const queryClient = useQueryClient();
  const store = useReleasesDashboardStore();

  const DASHBOARD_KEYS = {
    dashboard: (params) => ["releasesDashboard", params],
  };

  // ============ Query ============

  const getDashboardQuery = (params = {}) => {
    return useQuery({
      queryKey: DASHBOARD_KEYS.dashboard(params),
      queryFn: () => releasesDashboardService.getDashboard(params),
      enabled: true,
      onSuccess: (response) => {
        if (response.success) {
          store.setStatistics(response.data.statistics);
          store.setItems(
            response.data.items || [],
            response.data.pagination || {}
          );
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch dashboard data");
      },
    });
  };

  // ============ API Methods ============

  const getDashboard = (params = {}) => {
    store.clearError();
    store.setLoading(true);
    const query = getDashboardQuery(params);
    return query;
  };

  const refetch = () => {
    store.clearError();
    queryClient.invalidateQueries({ queryKey: ["releasesDashboard"] });
    return queryClient.refetchQueries({ queryKey: ["releasesDashboard"] });
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    statistics: store.statistics,
    items: store.items,
    pagination: store.pagination,
    isLoading: store.isLoading,
    error: store.error,
    filters: store.filters,

    // Query
    getDashboard,
    refetch,

    // Query status
    isFetching: getDashboardQuery({}).isFetching,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useReleasesDashboard;
