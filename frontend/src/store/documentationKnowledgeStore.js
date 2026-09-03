// src/store/documentationKnowledgeStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  documentation: [],
  currentDocumentation: null,
  knowledgeEntries: [],
  currentKnowledge: null,
  categories: [],
  stats: null,
  recentItems: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    docType: null,
    category: null,
    tags: [],
  },
  searchResults: [],
  isSearching: false,
};

export const useDocumentationKnowledgeStore = create(
  persist(
    (set) => ({
      ...initialState,

      setDocumentation: (docs, meta) =>
        set((state) => ({
          documentation: docs,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.pages || state.pagination.pages,
          },
        })),

      setCurrentDocumentation: (doc) => set({ currentDocumentation: doc }),

      addDocumentation: (doc) =>
        set((state) => ({
          documentation: [doc, ...state.documentation],
        })),

      updateDocumentation: (id, updates) =>
        set((state) => ({
          documentation: state.documentation.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
          currentDocumentation:
            state.currentDocumentation?.id === id
              ? { ...state.currentDocumentation, ...updates }
              : state.currentDocumentation,
        })),

      removeDocumentation: (id) =>
        set((state) => ({
          documentation: state.documentation.filter((doc) => doc.id !== id),
          currentDocumentation:
            state.currentDocumentation?.id === id
              ? null
              : state.currentDocumentation,
        })),

      setKnowledgeEntries: (entries, meta) =>
        set((state) => ({
          knowledgeEntries: entries,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.pages || state.pagination.pages,
          },
        })),

      setCurrentKnowledge: (entry) => set({ currentKnowledge: entry }),

      addKnowledgeEntry: (entry) =>
        set((state) => ({
          knowledgeEntries: [entry, ...state.knowledgeEntries],
        })),

      updateKnowledgeEntry: (id, updates) =>
        set((state) => ({
          knowledgeEntries: state.knowledgeEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
          currentKnowledge:
            state.currentKnowledge?.id === id
              ? { ...state.currentKnowledge, ...updates }
              : state.currentKnowledge,
        })),

      removeKnowledgeEntry: (id) =>
        set((state) => ({
          knowledgeEntries: state.knowledgeEntries.filter(
            (entry) => entry.id !== id
          ),
          currentKnowledge:
            state.currentKnowledge?.id === id ? null : state.currentKnowledge,
        })),

      setCategories: (categories) => set({ categories }),

      setStats: (stats) => set({ stats }),

      setRecentItems: (items) => set({ recentItems: items }),

      setSearchResults: (results) =>
        set({ searchResults: results, isSearching: true }),

      clearSearch: () => set({ searchResults: [], isSearching: false }),

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

      clearAll: () =>
        set({
          currentDocumentation: null,
          currentKnowledge: null,
          searchResults: [],
          isSearching: false,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "documentation-knowledge-storage",
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
        categories: state.categories,
      }),
    }
  )
);
