// src/store/decisionRisksDashboardStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  stats: null,
  items: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  isLoading: false,
  error: null,
  filters: {
    decisionImpact: null,
    riskLevel: null,
    riskStatus: null,
    fromDate: null,
    toDate: null,
    months: 12,
  },
};

export const useDecisionRisksDashboardStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (stats) => set({ stats }),

      setItems: (items, pagination) =>
        set((state) => ({
          items,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      reset: () => set(initialState),
    }),
    {
      name: "decision-risks-dashboard-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
