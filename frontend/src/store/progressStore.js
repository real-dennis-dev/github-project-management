// src/store/progressStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  timelineEntries: [],
  currentEntry: null,
  progressOverview: null,
  monthlyProgress: null,
  progressReport: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    fromDate: null,
    toDate: null,
    featureName: null,
    sortBy: "month_year",
    sortOrder: "asc",
  },
  stats: {
    total: 0,
    average: 0,
    completed: 0,
    inProgress: 0,
  },
};

export const useProgressStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTimelineEntries: (entries, pagination) =>
        set((state) => ({
          timelineEntries: entries,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
        })),

      addTimelineEntry: (entry) =>
        set((state) => ({
          timelineEntries: [entry, ...state.timelineEntries],
        })),

      updateTimelineEntry: (entry) =>
        set((state) => ({
          timelineEntries: state.timelineEntries.map((e) =>
            e.id === entry.id ? entry : e
          ),
        })),

      removeTimelineEntry: (id) =>
        set((state) => ({
          timelineEntries: state.timelineEntries.filter((e) => e.id !== id),
        })),

      setCurrentEntry: (entry) => set({ currentEntry: entry }),

      setProgressOverview: (overview) => set({ progressOverview: overview }),

      setMonthlyProgress: (data) => set({ monthlyProgress: data }),

      setProgressReport: (report) => set({ progressReport: report }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setStats: (stats) => set({ stats: { ...stats } }),

      clearError: () => set({ error: null }),

      clearProgress: () =>
        set({
          currentEntry: null,
          progressOverview: null,
          monthlyProgress: null,
          progressReport: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "progress-storage",
      partialize: (state) => ({
        filters: state.filters,
        stats: state.stats,
      }),
    }
  )
);
