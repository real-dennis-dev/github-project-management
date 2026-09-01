// src/store/expensesDashboardStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  dashboard: null,
  latestExpenses: [],
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
  generatedAt: null,
  filters: {
    category: "",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    vendor: "",
    recurring: null,
  },
};

export const useExpensesDashboardStore = create(
  persist(
    (set) => ({
      ...initialState,

      setDashboard: (dashboard) =>
        set({
          dashboard,
          generatedAt: dashboard?.generatedAt || new Date().toISOString(),
        }),

      setLatestExpenses: (expenses, pagination) =>
        set((state) => ({
          latestExpenses: expenses,
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

      resetFilters: () =>
        set((state) => ({
          filters: { ...initialState.filters },
        })),

      reset: () => set(initialState),
    }),
    {
      name: "expenses-dashboard-storage",
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
