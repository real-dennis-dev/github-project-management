// src/store/githubStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  repositories: [],
  currentRepository: null,
  commits: [],
  branches: [],
  pullRequests: [],
  issues: [],
  repositoryStats: null,
  webhookConfig: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  syncStatus: {
    isSyncing: false,
    progress: 0,
    lastSyncedAt: null,
  },
  filters: {
    state: "all",
    author: "",
    search: "",
    since: null,
    until: null,
  },
};

export const useGithubStore = create(
  persist(
    (set) => ({
      ...initialState,

      setRepositories: (repositories) => set({ repositories }),

      setCurrentRepository: (repository) =>
        set({ currentRepository: repository }),

      addRepository: (repository) =>
        set((state) => ({
          repositories: [repository, ...state.repositories],
        })),

      removeRepository: (repositoryId) =>
        set((state) => ({
          repositories: state.repositories.filter((r) => r.id !== repositoryId),
        })),

      updateRepository: (repositoryId, updates) =>
        set((state) => ({
          repositories: state.repositories.map((r) =>
            r.id === repositoryId ? { ...r, ...updates } : r
          ),
        })),

      setCommits: (commits, pagination) =>
        set((state) => ({
          commits,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
        })),

      setBranches: (branches) => set({ branches }),

      setPullRequests: (pullRequests, pagination) =>
        set((state) => ({
          pullRequests,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
        })),

      setIssues: (issues, pagination) =>
        set((state) => ({
          issues,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
        })),

      setRepositoryStats: (stats) => set({ repositoryStats: stats }),

      setWebhookConfig: (config) => set({ webhookConfig: config }),

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

      setSyncStatus: (syncStatus) =>
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...syncStatus },
        })),

      clearError: () => set({ error: null }),

      clearGithub: () =>
        set({
          currentRepository: null,
          commits: [],
          branches: [],
          pullRequests: [],
          issues: [],
          repositoryStats: null,
          webhookConfig: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "github-storage",
      partialize: (state) => ({
        repositories: state.repositories.slice(0, 10),
        filters: state.filters,
      }),
    }
  )
);
