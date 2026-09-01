// src/hooks/useAllTechDebt.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAllTechDebtStore } from "../store/allTechDebtStore";
import techDebtService from "../services/techDebtService";

export const useAllTechDebt = (params = {}) => {
  const queryClient = useQueryClient();
  const store = useAllTechDebtStore();

  const ALL_TD_KEYS = {
    stats: (queryParams) => ["allTechDebt", "stats", queryParams],
  };

  // Execute useQuery at the top level of the hook
  const statsQuery = useQuery({
    queryKey: ALL_TD_KEYS.stats(params),
    queryFn: async () => {
      store.clearError();
      store.setLoading(true);
      try {
        const response = await techDebtService.getGlobalStats(params);
        if (response.success) {
          store.setStats(response.data);
          if (response.data?.latest) {
            store.setLatestItems(
              response.data.latest.items || [],
              response.data.latest.pagination || {}
            );
          }
        }
        return response;
      } catch (error) {
        store.setError(
          error.message || "Failed to fetch global tech debt statistics"
        );
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    enabled: true,
  });

  const refetch = () => {
    store.clearError();
    return queryClient.invalidateQueries({ queryKey: ["allTechDebt"] });
  };

  // Store actions
  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    stats: store.stats,
    latestItems: store.latestItems,
    pagination: store.pagination,
    isLoading: statsQuery.isLoading || store.isLoading,
    isFetching: statsQuery.isFetching,
    error: store.error,
    lastUpdated: store.lastUpdated,
    filters: store.filters,

    // Query refetch
    refetch,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useAllTechDebt;
