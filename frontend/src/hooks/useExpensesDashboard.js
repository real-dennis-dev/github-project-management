import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useExpensesDashboardStore } from "../store/expensesDashboardStore";
import expenseService from "../services/expenseService";

const DASHBOARD_KEYS = {
  dashboard: (params) => ["expenses", "dashboard", params],
};

// Clean helper (not a hook)
const cleanParams = (params = {}) => {
  const cleaned = { ...params };
  Object.keys(cleaned).forEach((key) => {
    if (
      cleaned[key] === "" ||
      cleaned[key] === null ||
      cleaned[key] === undefined
    ) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

export const useExpensesDashboard = (params = {}) => {
  const queryClient = useQueryClient();
  const store = useExpensesDashboardStore();

  const sanitizedParams = cleanParams(params);

  // 1. Hook called strictly at the top level
  const query = useQuery({
    queryKey: DASHBOARD_KEYS.dashboard(sanitizedParams),
    queryFn: () => expenseService.getDashboard(sanitizedParams),
    enabled: true,
  });

  // 2. Synchronize query state/results with store in an effect
  useEffect(() => {
    if (query.isSuccess && query.data) {
      const response = query.data;
      if (response.success) {
        store.setDashboard(response.data);
        if (response.data?.latestExpenses) {
          store.setLatestExpenses(
            response.data.latestExpenses || [],
            response.data.pagination || {}
          );
        }
      }
    }

    if (query.isError && query.error) {
      store.setError(
        query.error.message || "Failed to fetch expense dashboard"
      );
    }
  }, [query.isSuccess, query.isError, query.data, query.error]);

  // 3. Simple action handlers
  const refetch = () => {
    store.clearError();
    queryClient.invalidateQueries({ queryKey: ["expenses", "dashboard"] });
    return query.refetch();
  };

  return {
    // Store & Query state
    dashboard: store.dashboard,
    latestExpenses: store.latestExpenses,
    pagination: store.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: store.error || (query.isError ? query.error.message : null),
    generatedAt: store.generatedAt,
    filters: store.filters,

    // Actions
    refetch,
    clearError: store.clearError,
    reset: store.reset,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
  };
};

export default useExpensesDashboard;
