// src/store/journalStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  entries: [],
  currentEntry: null,
  stats: null,
  monthlyData: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    fromDate: null,
    toDate: null,
    mood: null,
    sortBy: "entry_date",
    sortOrder: "DESC",
  },
};

export const useJournalStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Setters
      setEntries: (entries, meta) => {
        set({
          entries,
          pagination: meta?.pagination || get().pagination,
          isLoading: false,
        });
      },

      setCurrentEntry: (entry) => {
        set({ currentEntry: entry, isLoading: false });
      },

      setStats: (stats) => {
        set({ stats, isLoading: false });
      },

      setMonthlyData: (data) => {
        set({ monthlyData: data, isLoading: false });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      setPagination: (pagination) => {
        set({ pagination: { ...get().pagination, ...pagination } });
      },

      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } });
      },

      // Mutations
      addEntry: (entry) => {
        set((state) => ({
          entries: [entry, ...state.entries],
          isLoading: false,
        }));
      },

      updateEntry: (entry) => {
        set((state) => ({
          entries: state.entries.map((e) => (e.id === entry.id ? entry : e)),
          currentEntry:
            state.currentEntry?.id === entry.id ? entry : state.currentEntry,
          isLoading: false,
        }));
      },

      removeEntry: (entryId) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== entryId),
          currentEntry:
            state.currentEntry?.id === entryId ? null : state.currentEntry,
          isLoading: false,
        }));
      },

      clearJournal: () => {
        set(initialState);
      },

      resetFilters: () => {
        set({
          filters: initialState.filters,
          pagination: { ...initialState.pagination, page: 1 },
        });
      },
    }),
    {
      name: "journal-storage",
      partialize: (state) => ({
        entries: state.entries,
        currentEntry: state.currentEntry,
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
