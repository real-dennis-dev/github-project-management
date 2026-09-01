// src/store/allReleasesStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  statistics: null,
  items: [],
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
    search: "",
    type: "all", // 'all', 'release', 'milestone'
  },
};

export const useAllReleasesStore = create(
  persist(
    (set) => ({
      ...initialState,

      setDashboardData: (data) =>
        set({
          statistics: data.statistics,
          items: data.items || [],
          pagination: data.pagination || initialState.pagination,
          lastUpdated: data.statistics?.lastUpdated || new Date().toISOString(),
        }),

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
      name: "all-releases-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
