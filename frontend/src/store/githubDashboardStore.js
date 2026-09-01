// src/store/githubDashboardStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  stats: null,
  activity: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  generatedAt: null,
  filters: {
    search: "",
    type: null,
  },
};

export const useGithubDashboardStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (stats) =>
        set({
          stats,
          generatedAt: stats?.generatedAt || new Date().toISOString(),
        }),

      setActivity: (activity, pagination) =>
        set((state) => ({
          activity,
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
      name: "github-dashboard-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
