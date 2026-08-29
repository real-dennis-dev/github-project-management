// src/hooks/useProjects.js
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

export const useProjects = () => {
  const queryClient = useQueryClient();
  const store = useProjectStore();

  // Query Keys
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

  // ============ Project Queries ============

  const getProjectsQuery = (params = {}) => {
    const validatedParams = projectFilterSchema.cast(params);
    return useQuery({
      queryKey: PROJECT_KEYS.projects(validatedParams),
      queryFn: () => projectService.getProjects(validatedParams),
      onSuccess: (response) => {
        if (response.success) {
          store.setProjects(response.data, response.pagination);
          store.setPagination({
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 20,
          });
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch projects");
      },
    });
  };

  const getProjectQuery = (projectId) => {
    return useQuery({
      queryKey: PROJECT_KEYS.project(projectId),
      queryFn: () => projectService.getProject(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentProject(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch project");
      },
    });
  };

  const getProjectStatsQuery = (projectId) => {
    return useQuery({
      queryKey: PROJECT_KEYS.stats(projectId),
      queryFn: () => projectService.getProjectStats(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setProjectStats(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch project stats");
      },
    });
  };

  // ============ Feature Queries ============

  const getFeaturesQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: PROJECT_KEYS.features(projectId, params),
      queryFn: () => projectService.getFeatures(projectId, params),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setFeatures(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch features");
      },
    });
  };

  // ============ Bug Queries ============

  const getBugsQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: PROJECT_KEYS.bugs(projectId, params),
      queryFn: () => projectService.getBugs(projectId, params),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setBugs(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch bugs");
      },
    });
  };

  // ============ Subtask Queries ============

  const getSubtasksQuery = (featureId, params = {}) => {
    return useQuery({
      queryKey: PROJECT_KEYS.subtasks(featureId, params),
      queryFn: () => projectService.getSubtasks(featureId, params),
      enabled: !!featureId,
      onSuccess: (response) => {
        if (response.success) {
          store.setSubtasks(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch subtasks");
      },
    });
  };

  // ============ Project Mutations ============

  const createProjectMutation = useMutation({
    mutationFn: (data) => {
      return validateForm(projectSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.createProject(data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addProject(response.data);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create project");
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(projectSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.updateProject(projectId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update project");
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => projectService.deleteProject(projectId),
    onSuccess: (response, projectId) => {
      if (response.success) {
        store.removeProject(projectId);
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete project");
    },
  });

  // ============ Feature Mutations ============

  const createFeatureMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(featureSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.createFeature(projectId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create feature");
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: ({ featureId, data }) => {
      return validateForm(featureSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.updateFeature(featureId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update feature");
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

  // ============ Bug Mutations ============

  const createBugMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(bugSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.createBug(projectId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create bug");
    },
  });

  const updateBugMutation = useMutation({
    mutationFn: ({ bugId, data }) => {
      return validateForm(bugSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.updateBug(bugId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update bug");
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

  // ============ Subtask Mutations ============

  const createSubtaskMutation = useMutation({
    mutationFn: ({ featureId, data }) => {
      return validateForm(subtaskSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.createSubtask(featureId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create subtask");
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, data }) => {
      return validateForm(subtaskSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return projectService.updateSubtask(subtaskId, data);
      });
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
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update subtask");
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

  // ============ API Methods ============

  const getProjects = (params = {}) => {
    store.clearError();
    return getProjectsQuery(params);
  };

  const getProject = (projectId) => {
    store.clearError();
    return getProjectQuery(projectId);
  };

  const getProjectStats = (projectId) => {
    store.clearError();
    return getProjectStatsQuery(projectId);
  };

  const createProject = async (data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createProjectMutation.mutateAsync(data);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateProject = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateProjectMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteProjectMutation.mutateAsync(projectId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const getFeatures = (projectId, params = {}) => {
    store.clearError();
    return getFeaturesQuery(projectId, params);
  };

  const createFeature = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createFeatureMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateFeature = async (featureId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateFeatureMutation.mutateAsync({
        featureId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteFeature = async (featureId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteFeatureMutation.mutateAsync(featureId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const getBugs = (projectId, params = {}) => {
    store.clearError();
    return getBugsQuery(projectId, params);
  };

  const createBug = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createBugMutation.mutateAsync({ projectId, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateBug = async (bugId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateBugMutation.mutateAsync({ bugId, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteBug = async (bugId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteBugMutation.mutateAsync(bugId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const getSubtasks = (featureId, params = {}) => {
    store.clearError();
    return getSubtasksQuery(featureId, params);
  };

  const createSubtask = async (featureId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createSubtaskMutation.mutateAsync({
        featureId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateSubtask = async (subtaskId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateSubtaskMutation.mutateAsync({
        subtaskId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteSubtask = async (subtaskId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteSubtaskMutation.mutateAsync(subtaskId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearProjects = () => store.clearProjects();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);
  const setPagination = (pagination) => store.setPagination(pagination);

  return {
    // State from store
    projects: store.projects,
    currentProject: store.currentProject,
    features: store.features,
    bugs: store.bugs,
    subtasks: store.subtasks,
    projectStats: store.projectStats,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,

    // Query loading states
    isProjectsLoading: getProjectsQuery({}).isLoading,
    isProjectLoading: getProjectQuery("").isLoading,
    isStatsLoading: getProjectStatsQuery("").isLoading,
    isFeaturesLoading: getFeaturesQuery("").isLoading,
    isBugsLoading: getBugsQuery("").isLoading,
    isSubtasksLoading: getSubtasksQuery("").isLoading,

    // Mutation loading states
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

    // Query methods
    getProjects,
    getProject,
    getProjectStats,
    getFeatures,
    getBugs,
    getSubtasks,

    // Mutation methods
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
