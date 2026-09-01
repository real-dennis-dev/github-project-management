// src/hooks/useJournalDashboard.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useJournalDashboardStore } from "../store/journalDashboardStore";
import journalService from "../services/journalService";

export const useJournalDashboard = (params = {}) => {
  const queryClient = useQueryClient();
  const store = useJournalDashboardStore();

  const JOURNAL_DASHBOARD_KEYS = {
    stats: (queryParams) => ["journalDashboard", "stats", queryParams],
  };

  // ============ Query (Called directly at top level) ============

  const query = useQuery({
    queryKey: JOURNAL_DASHBOARD_KEYS.stats(params),
    queryFn: async () => {
      store.clearError();
      store.setLoading(true);
      try {
        const response = await journalService.getDashboardStats(params);
        if (response.success) {
          store.setStats(response.data?.stats);
          if (response.data?.projects) {
            store.setProjects(
              response.data.projects || [],
              response.data.pagination || {}
            );
          }
        }
        return response;
      } catch (err) {
        store.setError(
          err.message || "Failed to fetch journal dashboard statistics"
        );
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    enabled: true,
    staleTime: 1000 * 60, // 1 minute
  });

  // ============ API Methods ============

  const refetch = () => {
    store.clearError();
    queryClient.invalidateQueries({ queryKey: ["journalDashboard"] });
    return query.refetch();
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    stats: store.stats,
    projects: store.projects,
    pagination: store.pagination,
    isLoading: store.isLoading || query.isLoading,
    isFetching: query.isFetching,
    error: store.error,
    filters: store.filters,

    // Query Actions
    refetch,

    // Store actions
    clearError,
    reset,
    setFilters,
  };
};

export default useJournalDashboard;
