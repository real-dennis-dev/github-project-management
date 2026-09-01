// src/hooks/useDecisionRisksDashboard.js
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDecisionRisksDashboardStore } from "../store/decisionRisksDashboardStore";
import decisionRisksDashboardService from "../services/decisionRisksDashboardService";

export const useDecisionRisksDashboard = (params = {}) => {
  const queryClient = useQueryClient();
  const store = useDecisionRisksDashboardStore();

  const DASHBOARD_KEYS = {
    stats: (p) => ["decisionRisksDashboard", "stats", p],
  };

  // ✅ Hook called at top level
  const {
    data,
    isLoading,
    isFetching,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: DASHBOARD_KEYS.stats(params),
    queryFn: () => decisionRisksDashboardService.getDashboardStats(params),
    staleTime: 1000 * 60, // 1 minute
  });

  // Sync successful data into the store (optional – you can also just use the query data)
  // Prefer deriving state from the query result instead of duplicating it in Zustand
  // if possible. If you still want the store:
  // useEffect(() => {
  //   if (data?.success) {
  //     store.setStats(data.data);
  //     if (data.data?.items) {
  //       store.setItems(data.data.items || [], data.data.pagination || {});
  //     }
  //   }
  // }, [data]);

  const refetch = () => {
    store.clearError();
    return queryClient.invalidateQueries({
      queryKey: ["decisionRisksDashboard"],
    });
  };

  const clearError = () => store.clearError();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // Prefer query data over store when possible
    stats: data?.success ? data.data : store.stats,
    items: data?.success ? data.data?.items : store.items,
    pagination: data?.success ? data.data?.pagination : store.pagination,
    isLoading: isLoading || store.isLoading,
    isFetching,
    error: queryError?.message || store.error,
    filters: store.filters,

    refetch,
    clearError,
    reset,
    setFilters,
  };
};

export default useDecisionRisksDashboard;
