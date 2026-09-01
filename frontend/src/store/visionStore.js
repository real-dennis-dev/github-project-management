// src/store/visionStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  goals: [],
  currentGoal: null,
  statistics: null,
  categories: [],
  options: null,
  availableProjects: [],
  linkedProjects: [],
  goalProgress: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    status: null,
    category: null,
    search: null,
  },
  viewMode: "grid",
  selectedGoalIds: [],
};

export const useVisionStore = create(
  persist(
    (set) => ({
      ...initialState,

      setGoals: (goals, meta) =>
        set((state) => ({
          goals,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            pages: meta?.pagination?.totalPages || state.pagination.pages,
          },
        })),

      setCurrentGoal: (goal) => set({ currentGoal: goal }),

      addGoal: (goal) =>
        set((state) => ({
          goals: [goal, ...state.goals],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
          currentGoal:
            state.currentGoal?.id === id
              ? { ...state.currentGoal, ...updates }
              : state.currentGoal,
        })),

      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
          currentGoal: state.currentGoal?.id === id ? null : state.currentGoal,
        })),

      setStatistics: (statistics) => set({ statistics }),

      setCategories: (categories) => set({ categories }),

      setOptions: (options) => set({ options }),

      setAvailableProjects: (projects) => set({ availableProjects: projects }),

      setLinkedProjects: (projects) => set({ linkedProjects: projects }),

      setGoalProgress: (progress) => set({ goalProgress: progress }),

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

      setViewMode: (viewMode) => set({ viewMode }),

      setSelectedGoalIds: (selectedGoalIds) => set({ selectedGoalIds }),

      toggleGoalSelection: (id) =>
        set((state) => ({
          selectedGoalIds: state.selectedGoalIds.includes(id)
            ? state.selectedGoalIds.filter((goalId) => goalId !== id)
            : [...state.selectedGoalIds, id],
        })),

      clearSelection: () => set({ selectedGoalIds: [] }),

      clearError: () => set({ error: null }),

      clearVision: () =>
        set({
          currentGoal: null,
          goalProgress: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "vision-storage",
      partialize: (state) => ({
        goals: state.goals.slice(0, 20),
        categories: state.categories,
        filters: state.filters,
        pagination: state.pagination,
        viewMode: state.viewMode,
      }),
    }
  )
);
