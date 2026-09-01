// src/store/progressTimelineStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  globalStats: null,
  projects: [],
  chartData: null,
  meta: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    months: 12,
    search: "",
    sort_by: "latest_activity",
    sort_order: "desc",
  },
};

export const useProgressTimelineStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (data) =>
        set({
          globalStats: data?.globalStats || null,
          projects: data?.projects || [],
          chartData: data?.chartData || null,
          meta: data?.meta || null,
          lastUpdated: new Date().toISOString(),
        }),

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
      name: "progress-timeline-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
