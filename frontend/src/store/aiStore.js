// src/store/aiStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  conversations: [],
  currentConversation: null,
  currentAnalysis: null,
  currentReport: null,
  currentActions: null,
  currentTrends: null,
  currentSummary: null,
  aiStatus: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    questionContains: "",
    fromDate: null,
    toDate: null,
  },
};

export const useAIStore = create(
  persist(
    (set) => ({
      ...initialState,

      setConversations: (conversations, meta) =>
        set((state) => ({
          conversations,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.pages || state.pagination.pages,
          },
        })),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      setCurrentConversation: (conversation) =>
        set({ currentConversation: conversation }),

      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      setCurrentReport: (report) => set({ currentReport: report }),

      setCurrentActions: (actions) => set({ currentActions: actions }),

      setCurrentTrends: (trends) => set({ currentTrends: trends }),

      setCurrentSummary: (summary) => set({ currentSummary: summary }),

      setAIStatus: (status) => set({ aiStatus: status }),

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

      clearAI: () =>
        set({
          currentConversation: null,
          currentAnalysis: null,
          currentReport: null,
          currentActions: null,
          currentTrends: null,
          currentSummary: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "ai-storage",
      partialize: (state) => ({
        conversations: state.conversations.slice(0, 50),
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
