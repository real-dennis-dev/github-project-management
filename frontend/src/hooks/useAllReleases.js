import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAllReleasesStore } from "../store/allReleasesStore";
import releasesService from "../services/releasesService";

export const useAllReleases = (initialParams = {}) => {
  const queryClient = useQueryClient();
  const store = useAllReleasesStore();
  const [params, setParams] = useState(initialParams);

  const ALL_RELEASES_KEYS = {
    dashboard: (queryParams) => ["allReleases", "dashboard", queryParams],
  };

  // ============ Top-Level Query ============

  const query = useQuery({
    queryKey: ALL_RELEASES_KEYS.dashboard(params),
    queryFn: async () => {
      store.clearError();
      store.setLoading(true);
      try {
        const response = await releasesService.getDashboard(params);
        if (response.success) {
          store.setDashboardData(response.data);
        }
        return response;
      } catch (err) {
        store.setError(err.message || "Failed to fetch dashboard data");
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    enabled: true,
  });

  // ============ Actions ============

  const refetch = () => {
    store.clearError();
    return queryClient.invalidateQueries({ queryKey: ["allReleases"] });
  };

  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    statistics: store.statistics,
    items: store.items,
    pagination: store.pagination,
    isLoading: query.isLoading || store.isLoading,
    isFetching: query.isFetching,
    error: store.error,
    lastUpdated: store.lastUpdated,
    filters: store.filters,

    // Methods
    setParams, // Pass new params to trigger auto-refetch via queryKey
    refetch,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useAllReleases;
