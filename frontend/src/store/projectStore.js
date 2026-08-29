// src/store/projectStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  projects: [],
  currentProject: null,
  features: [],
  bugs: [],
  subtasks: [],
  projectStats: null,
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
    priority: "",
    search: "",
  },
};

export const useProjectStore = create(
  persist(
    (set) => ({
      ...initialState,

      setProjects: (projects, pagination) =>
        set((state) => ({
          projects,
          pagination: {
            ...state.pagination,
            ...pagination,
          },
        })),

      setCurrentProject: (project) => set({ currentProject: project }),

      setFeatures: (features) => set({ features }),

      setBugs: (bugs) => set({ bugs }),

      setSubtasks: (subtasks) => set({ subtasks }),

      setProjectStats: (stats) => set({ projectStats: stats }),

      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
        })),

      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
          currentProject:
            state.currentProject?.id === project.id
              ? project
              : state.currentProject,
        })),

      removeProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId
              ? null
              : state.currentProject,
        })),

      addFeature: (feature) =>
        set((state) => ({
          features: [feature, ...state.features],
        })),

      updateFeature: (feature) =>
        set((state) => ({
          features: state.features.map((f) =>
            f.id === feature.id ? feature : f
          ),
        })),

      removeFeature: (featureId) =>
        set((state) => ({
          features: state.features.filter((f) => f.id !== featureId),
        })),

      addBug: (bug) =>
        set((state) => ({
          bugs: [bug, ...state.bugs],
        })),

      updateBug: (bug) =>
        set((state) => ({
          bugs: state.bugs.map((b) => (b.id === bug.id ? bug : b)),
        })),

      removeBug: (bugId) =>
        set((state) => ({
          bugs: state.bugs.filter((b) => b.id !== bugId),
        })),

      addSubtask: (subtask) =>
        set((state) => ({
          subtasks: [subtask, ...state.subtasks],
        })),

      updateSubtask: (subtask) =>
        set((state) => ({
          subtasks: state.subtasks.map((s) =>
            s.id === subtask.id ? subtask : s
          ),
        })),

      removeSubtask: (subtaskId) =>
        set((state) => ({
          subtasks: state.subtasks.filter((s) => s.id !== subtaskId),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      clearError: () => set({ error: null }),

      clearProjects: () =>
        set({
          projects: [],
          currentProject: null,
          features: [],
          bugs: [],
          subtasks: [],
          projectStats: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        projects: state.projects.slice(0, 100),
        filters: state.filters,
        pagination: state.pagination,
      }),
    }
  )
);
