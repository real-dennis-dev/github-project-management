// src/store/techDebtStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  items: [],
  currentItem: null,
  overview: null,
  score: null,
  statistics: null,
  suggestions: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    priority: null,
    status: null,
    search: "",
    sortBy: "created_at",
    sortOrder: "DESC",
  },
};

export const useTechDebtStore = create(
  persist(
    (set) => ({
      ...initialState,

      setItems: (items, meta) =>
        set((state) => ({
          items,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.totalPages || state.pagination.pages,
          },
        })),

      setCurrentItem: (item) => set({ currentItem: item }),

      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
          currentItem:
            state.currentItem?.id === id
              ? { ...state.currentItem, ...updates }
              : state.currentItem,
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          currentItem: state.currentItem?.id === id ? null : state.currentItem,
        })),

      setOverview: (overview) => set({ overview }),

      setScore: (score) => set({ score }),

      setStatistics: (statistics) => set({ statistics }),

      setSuggestions: (suggestions) => set({ suggestions }),

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

      clearError: () => set({ error: null }),

      clearTechDebt: () =>
        set({
          currentItem: null,
          overview: null,
          score: null,
          statistics: null,
          suggestions: [],
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "techdebt-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
