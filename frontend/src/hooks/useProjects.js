// src/hooks/useProjects.js
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProjectStore } from "../store/projectStore";
import projectService from "../services/projectService";
import {
  projectSchema,
  featureSchema,
  bugSchema,
  subtaskSchema,
  projectFilterSchema,
  validateForm,
} from "../utils/projectValidation";

const PROJECT_KEYS = {
  projects: (params) => ["projects", params],
  project: (id) => ["project", id],
  features: (projectId, params) => ["features", projectId, params],
  feature: (id) => ["feature", id],
  bugs: (projectId, params) => ["bugs", projectId, params],
  bug: (id) => ["bug", id],
  subtasks: (featureId, params) => ["subtasks", featureId, params],
  subtask: (id) => ["subtask", id],
  stats: (projectId) => ["project-stats", projectId],
};

const getErrorMessage = (error, fallback) => {
  let message = error?.message || fallback;

  try {
    const errors = JSON.parse(message);
    message = Object.values(errors).join(", ");
  } catch {
    // Normal error message
  }

  return message || fallback;
};

export const useProjects = () => {
  const queryClient = useQueryClient();
  const store = useProjectStore();

  const {
    projects,
    currentProject,
    features,
    bugs,
    subtasks,
    projectStats,
    isLoading,
    error,
    pagination,
    filters,
  } = store;

  /*
   * ============================================================
   * QUERIES
   *
   * IMPORTANT:
   * All useQuery calls are directly inside useProjects().
   * NEVER put useQuery inside getProjects(), getProject(), etc.
   * ============================================================
   */

  const validatedProjectFilters = projectFilterSchema.cast(filters || {});

  const projectsQuery = useQuery({
    queryKey: PROJECT_KEYS.projects(validatedProjectFilters),

    queryFn: () => projectService.getProjects(validatedProjectFilters),

    placeholderData: (previousData) => previousData,
  });

  const projectId = currentProject?.id || null;

  const projectQuery = useQuery({
    queryKey: PROJECT_KEYS.project(projectId),

    queryFn: () => projectService.getProject(projectId),

    enabled: !!projectId,
  });

  const projectStatsQuery = useQuery({
    queryKey: PROJECT_KEYS.stats(projectId),

    queryFn: () => projectService.getProjectStats(projectId),

    enabled: !!projectId,
  });

  /*
   * These are disabled by default because we don't know which
   * project/feature the caller wants until they explicitly ask.
   */
  const featuresQuery = useQuery({
    queryKey: PROJECT_KEYS.features(projectId, {}),

    queryFn: () => projectService.getFeatures(projectId, {}),

    enabled: false,
  });

  const bugsQuery = useQuery({
    queryKey: PROJECT_KEYS.bugs(projectId, {}),

    queryFn: () => projectService.getBugs(projectId, {}),

    enabled: false,
  });

  const subtasksQuery = useQuery({
    queryKey: PROJECT_KEYS.subtasks(null, {}),

    queryFn: () => projectService.getSubtasks(null, {}),

    enabled: false,
  });

  /*
   * Sync query results into Zustand.
   */
  useEffect(() => {
    if (projectsQuery.data?.success) {
      store.setProjects(projectsQuery.data.data, projectsQuery.data.pagination);

      store.setPagination({
        page: projectsQuery.data.pagination?.page || 1,
        limit: projectsQuery.data.pagination?.limit || 20,
        pages: projectsQuery.data.pagination?.pages || 1,
        total: projectsQuery.data.pagination?.total || 0,
      });
    }
  }, [projectsQuery.data]);

  useEffect(() => {
    if (projectsQuery.error) {
      store.setError(projectsQuery.error.message || "Failed to fetch projects");
    }
  }, [projectsQuery.error]);

  useEffect(() => {
    if (projectQuery.data?.success) {
      store.setCurrentProject(projectQuery.data.data);
    }
  }, [projectQuery.data]);

  useEffect(() => {
    if (projectQuery.error) {
      store.setError(projectQuery.error.message || "Failed to fetch project");
    }
  }, [projectQuery.error]);

  useEffect(() => {
    if (projectStatsQuery.data?.success) {
      store.setProjectStats(projectStatsQuery.data.data);
    }
  }, [projectStatsQuery.data]);

  useEffect(() => {
    if (projectStatsQuery.error) {
      store.setError(
        projectStatsQuery.error.message || "Failed to fetch project stats"
      );
    }
  }, [projectStatsQuery.error]);

  /*
   * ============================================================
   * MUTATIONS
   * ============================================================
   */

  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      const validation = await validateForm(projectSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.createProject(data);
    },

    onSuccess: (response) => {
      if (response.success) {
        store.addProject(response.data);

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to create project"));
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(projectSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.updateProject(projectId, data);
    },

    onSuccess: (response) => {
      if (response.success) {
        store.updateProject(response.data);

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        });

        queryClient.invalidateQueries({
          queryKey: ["project", response.data.id],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to update project"));
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => projectService.deleteProject(projectId),

    onSuccess: (response, projectId) => {
      if (response.success) {
        store.removeProject(projectId);

        queryClient.invalidateQueries({
          queryKey: ["projects"],
        });
      }
    },

    onError: (error) => {
      store.setError(error.message || "Failed to delete project");
    },
  });

  /*
   * ============================================================
   * FEATURE MUTATIONS
   * ============================================================
   */

  const createFeatureMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(featureSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.createFeature(projectId, data);
    },

    onSuccess: (response, variables) => {
      if (response.success) {
        store.addFeature(response.data);

        queryClient.invalidateQueries({
          queryKey: ["features", variables.projectId],
        });

        queryClient.invalidateQueries({
          queryKey: ["project-stats", variables.projectId],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to create feature"));
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, data }) => {
      const validation = await validateForm(featureSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.updateFeature(featureId, data);
    },

    onSuccess: (response) => {
      if (response.success) {
        store.updateFeature(response.data);

        queryClient.invalidateQueries({
          queryKey: ["features"],
        });

        queryClient.invalidateQueries({
          queryKey: ["feature", response.data.id],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to update feature"));
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: (featureId) => projectService.deleteFeature(featureId),

    onSuccess: (response, featureId) => {
      if (response.success) {
        store.removeFeature(featureId);

        queryClient.invalidateQueries({
          queryKey: ["features"],
        });
      }
    },

    onError: (error) => {
      store.setError(error.message || "Failed to delete feature");
    },
  });

  /*
   * ============================================================
   * BUG MUTATIONS
   * ============================================================
   */

  const createBugMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(bugSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.createBug(projectId, data);
    },

    onSuccess: (response, variables) => {
      if (response.success) {
        store.addBug(response.data);

        queryClient.invalidateQueries({
          queryKey: ["bugs", variables.projectId],
        });

        queryClient.invalidateQueries({
          queryKey: ["project-stats", variables.projectId],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to create bug"));
    },
  });

  const updateBugMutation = useMutation({
    mutationFn: async ({ bugId, data }) => {
      const validation = await validateForm(bugSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.updateBug(bugId, data);
    },

    onSuccess: (response) => {
      if (response.success) {
        store.updateBug(response.data);

        queryClient.invalidateQueries({
          queryKey: ["bugs"],
        });

        queryClient.invalidateQueries({
          queryKey: ["bug", response.data.id],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to update bug"));
    },
  });

  const deleteBugMutation = useMutation({
    mutationFn: (bugId) => projectService.deleteBug(bugId),

    onSuccess: (response, bugId) => {
      if (response.success) {
        store.removeBug(bugId);

        queryClient.invalidateQueries({
          queryKey: ["bugs"],
        });
      }
    },

    onError: (error) => {
      store.setError(error.message || "Failed to delete bug");
    },
  });

  /*
   * ============================================================
   * SUBTASK MUTATIONS
   * ============================================================
   */

  const createSubtaskMutation = useMutation({
    mutationFn: async ({ featureId, data }) => {
      const validation = await validateForm(subtaskSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.createSubtask(featureId, data);
    },

    onSuccess: (response, variables) => {
      if (response.success) {
        store.addSubtask(response.data);

        queryClient.invalidateQueries({
          queryKey: ["subtasks", variables.featureId],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to create subtask"));
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, data }) => {
      const validation = await validateForm(subtaskSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return projectService.updateSubtask(subtaskId, data);
    },

    onSuccess: (response) => {
      if (response.success) {
        store.updateSubtask(response.data);

        queryClient.invalidateQueries({
          queryKey: ["subtasks"],
        });

        queryClient.invalidateQueries({
          queryKey: ["subtask", response.data.id],
        });
      }
    },

    onError: (error) => {
      store.setError(getErrorMessage(error, "Failed to update subtask"));
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId) => projectService.deleteSubtask(subtaskId),

    onSuccess: (response, subtaskId) => {
      if (response.success) {
        store.removeSubtask(subtaskId);

        queryClient.invalidateQueries({
          queryKey: ["subtasks"],
        });
      }
    },

    onError: (error) => {
      store.setError(error.message || "Failed to delete subtask");
    },
  });

  /*
   * ============================================================
   * API METHODS
   *
   * These methods DO NOT call React hooks.
   * ============================================================
   */

  const getProjects = async () => {
    store.clearError();

    const result = await projectsQuery.refetch();

    return result.data;
  };

  const getProject = async (id) => {
    store.clearError();

    if (!id) return null;

    const result = await queryClient.fetchQuery({
      queryKey: PROJECT_KEYS.project(id),
      queryFn: () => projectService.getProject(id),
    });

    if (result?.success) {
      store.setCurrentProject(result.data);
    }

    return result;
  };

  const getProjectStats = async (id) => {
    store.clearError();

    if (!id) return null;

    const result = await queryClient.fetchQuery({
      queryKey: PROJECT_KEYS.stats(id),
      queryFn: () => projectService.getProjectStats(id),
    });

    if (result?.success) {
      store.setProjectStats(result.data);
    }

    return result;
  };

  const getFeatures = async (id, params = {}) => {
    store.clearError();

    if (!id) return null;

    const result = await queryClient.fetchQuery({
      queryKey: PROJECT_KEYS.features(id, params),
      queryFn: () => projectService.getFeatures(id, params),
    });

    if (result?.success) {
      store.setFeatures(result.data);
    }

    return result;
  };

  const getBugs = async (id, params = {}) => {
    store.clearError();

    if (!id) return null;

    const result = await queryClient.fetchQuery({
      queryKey: PROJECT_KEYS.bugs(id, params),
      queryFn: () => projectService.getBugs(id, params),
    });

    if (result?.success) {
      store.setBugs(result.data);
    }

    return result;
  };

  const getSubtasks = async (id, params = {}) => {
    store.clearError();

    if (!id) return null;

    const result = await queryClient.fetchQuery({
      queryKey: PROJECT_KEYS.subtasks(id, params),
      queryFn: () => projectService.getSubtasks(id, params),
    });

    if (result?.success) {
      store.setSubtasks(result.data);
    }

    return result;
  };

  /*
   * ============================================================
   * MUTATION API METHODS
   * ============================================================
   */

  const createProject = async (data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await createProjectMutation.mutateAsync(data);
    } finally {
      store.setLoading(false);
    }
  };

  const updateProject = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await updateProjectMutation.mutateAsync({
        projectId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await deleteProjectMutation.mutateAsync(projectId);
    } finally {
      store.setLoading(false);
    }
  };

  const createFeature = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await createFeatureMutation.mutateAsync({
        projectId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const updateFeature = async (featureId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await updateFeatureMutation.mutateAsync({
        featureId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const deleteFeature = async (featureId) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await deleteFeatureMutation.mutateAsync(featureId);
    } finally {
      store.setLoading(false);
    }
  };

  const createBug = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await createBugMutation.mutateAsync({
        projectId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const updateBug = async (bugId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await updateBugMutation.mutateAsync({
        bugId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const deleteBug = async (bugId) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await deleteBugMutation.mutateAsync(bugId);
    } finally {
      store.setLoading(false);
    }
  };

  const createSubtask = async (featureId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await createSubtaskMutation.mutateAsync({
        featureId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const updateSubtask = async (subtaskId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await updateSubtaskMutation.mutateAsync({
        subtaskId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const deleteSubtask = async (subtaskId) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await deleteSubtaskMutation.mutateAsync(subtaskId);
    } finally {
      store.setLoading(false);
    }
  };

  /*
   * ============================================================
   * STORE ACTIONS
   * ============================================================
   */

  const clearError = () => store.clearError();
  const clearProjects = () => store.clearProjects();
  const reset = () => store.reset();
  const setFilters = (newFilters) => store.setFilters(newFilters);
  const setPagination = (newPagination) => store.setPagination(newPagination);

  /*
   * ============================================================
   * RETURN
   * ============================================================
   */

  return {
    // Zustand state
    projects,
    currentProject,
    features,
    bugs,
    subtasks,
    projectStats,
    isLoading,
    error,
    pagination,
    filters,

    // React Query states
    isProjectsLoading: projectsQuery.isLoading,
    isProjectsFetching: projectsQuery.isFetching,
    isProjectLoading: projectQuery.isLoading,
    isStatsLoading: projectStatsQuery.isLoading,
    isFeaturesLoading: featuresQuery.isLoading,
    isBugsLoading: bugsQuery.isLoading,
    isSubtasksLoading: subtasksQuery.isLoading,

    // Mutations
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,

    isCreatingFeature: createFeatureMutation.isPending,
    isUpdatingFeature: updateFeatureMutation.isPending,
    isDeletingFeature: deleteFeatureMutation.isPending,

    isCreatingBug: createBugMutation.isPending,
    isUpdatingBug: updateBugMutation.isPending,
    isDeletingBug: deleteBugMutation.isPending,

    isCreatingSubtask: createSubtaskMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,

    // Queries
    getProjects,
    getProject,
    getProjectStats,
    getFeatures,
    getBugs,
    getSubtasks,

    // Mutations
    createProject,
    updateProject,
    deleteProject,

    createFeature,
    updateFeature,
    deleteFeature,

    createBug,
    updateBug,
    deleteBug,

    createSubtask,
    updateSubtask,
    deleteSubtask,

    // Store actions
    clearError,
    clearProjects,
    reset,
    setFilters,
    setPagination,
  };
};

export default useProjects;
