// src/store/journalDashboardStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  stats: null,
  projects: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  filters: {
    fromDate: null,
    toDate: null,
  },
};

export const useJournalDashboardStore = create(
  persist(
    (set) => ({
      ...initialState,

      setStats: (stats) => set({ stats }),

      setProjects: (projects, pagination) =>
        set((state) => ({
          projects,
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
      name: "journal-dashboard-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
