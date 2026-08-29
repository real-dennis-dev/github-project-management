// src/store/releasesStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  releases: [],
  currentRelease: null,
  releaseStats: null,
  milestones: [],
  currentMilestone: null,
  milestoneStats: null,
  overdueMilestones: [],
  releaseProgress: null,
  milestoneProgress: null,
  changelog: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    status: "",
    sortBy: "created_at",
    sortOrder: "DESC",
  },
  milestoneFilters: {
    status: "",
    sortBy: "target_date",
    sortOrder: "ASC",
  },
};

export const useReleasesStore = create(
  persist(
    (set) => ({
      ...initialState,

      // Release actions
      setReleases: (releases, meta) =>
        set((state) => ({
          releases,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.totalPages || state.pagination.pages,
            page: meta?.pagination?.page || state.pagination.page,
            limit: meta?.pagination?.limit || state.pagination.limit,
          },
          releaseStats: meta?.statistics || state.releaseStats,
        })),

      setCurrentRelease: (release) => set({ currentRelease: release }),

      addRelease: (release) =>
        set((state) => ({
          releases: [release, ...state.releases],
        })),

      updateRelease: (release) =>
        set((state) => ({
          releases: state.releases.map((r) =>
            r.id === release.id ? release : r
          ),
          currentRelease:
            state.currentRelease?.id === release.id
              ? release
              : state.currentRelease,
        })),

      removeRelease: (releaseId) =>
        set((state) => ({
          releases: state.releases.filter((r) => r.id !== releaseId),
          currentRelease:
            state.currentRelease?.id === releaseId
              ? null
              : state.currentRelease,
        })),

      setReleaseStats: (stats) => set({ releaseStats: stats }),

      setReleaseProgress: (progress) => set({ releaseProgress: progress }),

      setChangelog: (changelog) => set({ changelog }),

      // Milestone actions
      setMilestones: (milestones, meta) =>
        set((state) => ({
          milestones,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.totalPages || state.pagination.pages,
            page: meta?.pagination?.page || state.pagination.page,
            limit: meta?.pagination?.limit || state.pagination.limit,
          },
          milestoneStats: meta?.statistics || state.milestoneStats,
        })),

      setCurrentMilestone: (milestone) => set({ currentMilestone: milestone }),

      addMilestone: (milestone) =>
        set((state) => ({
          milestones: [milestone, ...state.milestones],
        })),

      updateMilestone: (milestone) =>
        set((state) => ({
          milestones: state.milestones.map((m) =>
            m.id === milestone.id ? milestone : m
          ),
          currentMilestone:
            state.currentMilestone?.id === milestone.id
              ? milestone
              : state.currentMilestone,
        })),

      removeMilestone: (milestoneId) =>
        set((state) => ({
          milestones: state.milestones.filter((m) => m.id !== milestoneId),
          currentMilestone:
            state.currentMilestone?.id === milestoneId
              ? null
              : state.currentMilestone,
        })),

      setMilestoneStats: (stats) => set({ milestoneStats: stats }),

      setMilestoneProgress: (progress) => set({ milestoneProgress: progress }),

      setOverdueMilestones: (overdue) => set({ overdueMilestones: overdue }),

      // Bulk update
      bulkUpdateMilestones: (updatedMilestones) =>
        set((state) => ({
          milestones: state.milestones.map((m) => {
            const updated = updatedMilestones.find((u) => u.id === m.id);
            return updated || m;
          }),
        })),

      // Common actions
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setMilestoneFilters: (filters) =>
        set((state) => ({
          milestoneFilters: { ...state.milestoneFilters, ...filters },
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      clearError: () => set({ error: null }),

      clearReleases: () =>
        set({
          currentRelease: null,
          releaseProgress: null,
          changelog: null,
        }),

      clearMilestones: () =>
        set({
          currentMilestone: null,
          milestoneProgress: null,
          overdueMilestones: [],
        }),

      reset: () => set(initialState),
    }),
    {
      name: "releases-storage",
      partialize: (state) => ({
        releases: state.releases.slice(0, 50),
        milestones: state.milestones.slice(0, 50),
        filters: state.filters,
        milestoneFilters: state.milestoneFilters,
        pagination: state.pagination,
      }),
    }
  )
);
