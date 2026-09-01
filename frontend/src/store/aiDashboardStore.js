// src/store/aiDashboardStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  stats: null,
  activities: [],
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
    type: null,
    projectId: null,
    fromDate: null,
    toDate: null,
  },
};

export const useAIDashboardStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (stats) => set({ stats }),

      setActivities: (activities, pagination) =>
        set((state) => ({
          activities,
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
      name: "ai-dashboard-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
