// src/hooks/useAllReleases.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAllReleasesStore } from "../store/allReleasesStore";
import allReleasesService from "../services/allReleasesService";

export const useAllReleases = () => {
  const queryClient = useQueryClient();
  const store = useAllReleasesStore();

  const ALL_RELEASES_KEYS = {
    dashboard: (params) => ["allReleases", "dashboard", params],
  };

  // ============ Query ============

  const getDashboardQuery = (params = {}) => {
    return useQuery({
      queryKey: ALL_RELEASES_KEYS.dashboard(params),
      queryFn: () => allReleasesService.getDashboard(params),
      enabled: true,
      onSuccess: (response) => {
        if (response.success) {
          store.setDashboardData(response.data);
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
    // Handle loading state - use query's isLoading
    return query;
  };

  const refetch = () => {
    store.clearError();
    queryClient.invalidateQueries({ queryKey: ["allReleases"] });
    return queryClient.refetchQueries({ queryKey: ["allReleases"] });
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
    lastUpdated: store.lastUpdated,
    filters: store.filters,

    // Query
    getDashboard,
    refetch,

    // Query status (from the latest query)
    isFetching: getDashboardQuery({}).isFetching,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useAllReleases;
