import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProgressTimelineStore } from "../store/progressTimelineStore";
import progressService from "../services/progressService";

export const useProgressTimeline = (initialParams = {}) => {
  const queryClient = useQueryClient();
  const store = useProgressTimelineStore();
  const [params, setParams] = useState(initialParams);

  const PT_KEYS = {
    stats: (queryParams) => ["progressTimeline", "stats", queryParams],
  };

  // Call useQuery directly at the top level of the custom hook
  const statsQuery = useQuery({
    queryKey: PT_KEYS.stats(params),
    queryFn: () => progressService.getGlobalStats(params),
    enabled: true,
  });

  // Sync query results to Zustand store if needed, or handle side effects
  const fetchStats = (newParams = {}) => {
    store.clearError();
    setParams(newParams);
  };

  const refetch = () => {
    store.clearError();
    return queryClient.invalidateQueries({ queryKey: ["progressTimeline"] });
  };

  return {
    // Data & Query state
    statsData: statsQuery.data,
    isFetching: statsQuery.isFetching,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error?.message || store.error,

    // Store state
    globalStats: store.globalStats,
    projects: store.projects,
    chartData: store.chartData,
    meta: store.meta,
    pagination: store.pagination,
    filters: store.filters,

    // Actions
    fetchStats,
    refetch,
    clearError: store.clearError,
    reset: store.reset,
    setFilters: store.setFilters,
  };
};

export default useProgressTimeline;
