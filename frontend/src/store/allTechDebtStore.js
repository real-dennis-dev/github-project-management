// src/store/allTechDebtStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  stats: null,
  latestItems: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: {
    priority: null,
    status: null,
    search: "",
  },
};

export const useAllTechDebtStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (stats) =>
        set({
          stats,
          lastUpdated: stats?.lastUpdated || new Date().toISOString(),
        }),

      setLatestItems: (items, pagination) =>
        set((state) => ({
          latestItems: items,
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
      name: "all-techdebt-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
