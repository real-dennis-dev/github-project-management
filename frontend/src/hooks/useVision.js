// src/hooks/useVision.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVisionStore } from "../store/visionStore";
import visionService from "../services/visionService";
import {
  visionGoalCreateSchema,
  visionGoalUpdateSchema,
  visionFilterSchema,
  linkProjectSchema,
  validateForm,
} from "../utils/visionValidation";

export const useVision = () => {
  const queryClient = useQueryClient();
  const store = useVisionStore();

  // Query Keys
  const VISION_KEYS = {
    goals: (params) => ["vision", "goals", params],
    goal: (id) => ["vision", "goal", id],
    statistics: ["vision", "statistics"],
    categories: ["vision", "categories"],
    options: ["vision", "options"],
    progress: (id) => ["vision", "progress", id],
    availableProjects: (id) => ["vision", "available-projects", id],
    linkedProjects: (id) => ["vision", "linked-projects", id],
    activities: (limit) => ["vision", "activities", limit],
    dashboard: ["vision", "dashboard"],
    goalsByStatus: (status) => ["vision", "goals-by-status", status],
  };

  // ============ Queries ============

  // Get goals query
  const getGoalsQuery = (params = {}) => {
    const validatedParams = visionFilterSchema.cast(params);
    return useQuery({
      queryKey: VISION_KEYS.goals(validatedParams),
      queryFn: () => visionService.getGoals(validatedParams),
      onSuccess: (response) => {
        if (response.success) {
          store.setGoals(response.data, response.meta);
          if (response.meta?.statistics) {
            store.setStatistics(response.meta.statistics);
          }
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch vision goals");
      },
    });
  };

  // Get single goal query
  const getGoalQuery = (id) => {
    return useQuery({
      queryKey: VISION_KEYS.goal(id),
      queryFn: () => visionService.getGoal(id),
      enabled: !!id,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentGoal(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch vision goal");
      },
    });
  };

  // Get statistics query
  const getStatisticsQuery = () => {
    return useQuery({
      queryKey: VISION_KEYS.statistics,
      queryFn: () => visionService.getStatistics(),
      staleTime: 1000 * 60 * 2,
      onSuccess: (response) => {
        if (response.success) {
          store.setStatistics(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch statistics");
      },
    });
  };

  // Get categories query
  const getCategoriesQuery = () => {
    return useQuery({
      queryKey: VISION_KEYS.categories,
      queryFn: () => visionService.getCategories(),
      staleTime: 1000 * 60 * 5,
      onSuccess: (response) => {
        if (response.success) {
          store.setCategories(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch categories");
      },
    });
  };

  // Get options query
  const getOptionsQuery = () => {
    return useQuery({
      queryKey: VISION_KEYS.options,
      queryFn: () => visionService.getOptions(),
      staleTime: 1000 * 60 * 10,
      onSuccess: (response) => {
        if (response.success) {
          store.setOptions(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch options");
      },
    });
  };

  // Get goal progress query
  const getGoalProgressQuery = (id) => {
    return useQuery({
      queryKey: VISION_KEYS.progress(id),
      queryFn: () => visionService.getGoalProgress(id),
      enabled: !!id,
      onSuccess: (response) => {
        if (response.success) {
          store.setGoalProgress(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch goal progress");
      },
    });
  };

  // Get available projects query
  const getAvailableProjectsQuery = (id) => {
    return useQuery({
      queryKey: VISION_KEYS.availableProjects(id),
      queryFn: () => visionService.getAvailableProjects(id),
      enabled: !!id,
      onSuccess: (response) => {
        if (response.success) {
          store.setAvailableProjects(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch available projects");
      },
    });
  };

  // Get linked projects query
  const getLinkedProjectsQuery = (id) => {
    return useQuery({
      queryKey: VISION_KEYS.linkedProjects(id),
      queryFn: () => visionService.getGoalLinkedProjects(id),
      enabled: !!id,
      onSuccess: (response) => {
        if (response.success) {
          store.setLinkedProjects(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch linked projects");
      },
    });
  };

  // Get activities query
  const getActivitiesQuery = (limit = 10) => {
    return useQuery({
      queryKey: VISION_KEYS.activities(limit),
      queryFn: () => visionService.getRecentActivities(limit),
      staleTime: 1000 * 60 * 2,
      onError: (error) => {
        store.setError(error.message || "Failed to fetch activities");
      },
    });
  };

  // Get dashboard query
  const getDashboardQuery = () => {
    return useQuery({
      queryKey: VISION_KEYS.dashboard,
      queryFn: () => visionService.getDashboardData(),
      staleTime: 1000 * 60 * 2,
      onError: (error) => {
        store.setError(error.message || "Failed to fetch dashboard data");
      },
    });
  };

  // Get goals by status query
  const getGoalsByStatusQuery = (status) => {
    return useQuery({
      queryKey: VISION_KEYS.goalsByStatus(status),
      queryFn: () => visionService.getGoalsByStatus(status),
      enabled: !!status,
      onError: (error) => {
        store.setError(error.message || "Failed to fetch goals by status");
      },
    });
  };

  // ============ Mutations ============

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data) => {
      return validateForm(visionGoalCreateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return visionService.createGoal(data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addGoal(response.data);
        queryClient.invalidateQueries({ queryKey: ["vision", "goals"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "statistics"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "dashboard"] });
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
      store.setError(message || "Failed to create vision goal");
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return validateForm(visionGoalUpdateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return visionService.updateGoal(id, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateGoal(response.data.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["vision", "goals"] });
        queryClient.invalidateQueries({
          queryKey: ["vision", "goal", response.data.id],
        });
        queryClient.invalidateQueries({ queryKey: ["vision", "statistics"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "dashboard"] });
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
      store.setError(message || "Failed to update vision goal");
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (id) => visionService.deleteGoal(id),
    onSuccess: (_, id) => {
      store.removeGoal(id);
      queryClient.invalidateQueries({ queryKey: ["vision", "goals"] });
      queryClient.invalidateQueries({ queryKey: ["vision", "statistics"] });
      queryClient.invalidateQueries({ queryKey: ["vision", "dashboard"] });
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete vision goal");
    },
  });

  // Bulk delete mutation
  const bulkDeleteGoalsMutation = useMutation({
    mutationFn: (ids) => visionService.bulkDeleteGoals(ids),
    onSuccess: (response) => {
      if (response.success) {
        // Remove all deleted goals from store
        const deletedIds = response.data?.deleted_ids || [];
        deletedIds.forEach((id) => store.removeGoal(id));
        store.clearSelection();
        queryClient.invalidateQueries({ queryKey: ["vision", "goals"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "statistics"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "dashboard"] });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete selected goals");
    },
  });

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ ids, status }) =>
      visionService.bulkUpdateStatus(ids, status),
    onSuccess: (response) => {
      if (response.success) {
        // Update all affected goals in store
        const updatedGoals = response.data?.updated_goals || [];
        updatedGoals.forEach((goal) => store.updateGoal(goal.id, goal));
        store.clearSelection();
        queryClient.invalidateQueries({ queryKey: ["vision", "goals"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "statistics"] });
        queryClient.invalidateQueries({ queryKey: ["vision", "dashboard"] });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to update status");
    },
  });

  // Link project mutation
  const linkProjectMutation = useMutation({
    mutationFn: ({ goalId, data }) => {
      return validateForm(linkProjectSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return visionService.linkProject(goalId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateGoal(response.data.goal.id, response.data.goal);
        queryClient.invalidateQueries({
          queryKey: ["vision", "goal", response.data.goal.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vision", "progress", response.data.goal.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vision", "available-projects", response.data.goal.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vision", "linked-projects", response.data.goal.id],
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
      store.setError(message || "Failed to link project");
    },
  });

  // Unlink project mutation
  const unlinkProjectMutation = useMutation({
    mutationFn: ({ goalId, projectId }) =>
      visionService.unlinkProject(goalId, projectId),
    onSuccess: (response) => {
      if (response.success) {
        store.updateGoal(response.data.id, response.data);
        queryClient.invalidateQueries({
          queryKey: ["vision", "goal", response.data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vision", "progress", response.data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vision", "available-projects", response.data.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["vision", "linked-projects", response.data.id],
        });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to unlink project");
    },
  });

  // ============ API Methods ============

  const getGoals = (params = {}) => {
    store.clearError();
    return getGoalsQuery(params);
  };

  const getGoal = (id) => {
    store.clearError();
    return getGoalQuery(id);
  };

  const getStatistics = () => {
    store.clearError();
    return getStatisticsQuery();
  };

  const getCategories = () => {
    store.clearError();
    return getCategoriesQuery();
  };

  const getOptions = () => {
    store.clearError();
    return getOptionsQuery();
  };

  const getGoalProgress = (id) => {
    store.clearError();
    return getGoalProgressQuery(id);
  };

  const getAvailableProjects = (id) => {
    store.clearError();
    return getAvailableProjectsQuery(id);
  };

  const getLinkedProjects = (id) => {
    store.clearError();
    return getLinkedProjectsQuery(id);
  };

  const getActivities = (limit = 10) => {
    store.clearError();
    return getActivitiesQuery(limit);
  };

  const getDashboard = () => {
    store.clearError();
    return getDashboardQuery();
  };

  const getGoalsByStatus = (status) => {
    store.clearError();
    return getGoalsByStatusQuery(status);
  };

  const createGoal = async (data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createGoalMutation.mutateAsync(data);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateGoal = async (id, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateGoalMutation.mutateAsync({ id, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteGoalMutation.mutateAsync(id);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const bulkDeleteGoals = async (ids) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await bulkDeleteGoalsMutation.mutateAsync(ids);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const bulkUpdateStatus = async (ids, status) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await bulkUpdateStatusMutation.mutateAsync({
        ids,
        status,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const linkProject = async (goalId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await linkProjectMutation.mutateAsync({ goalId, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const unlinkProject = async (goalId, projectId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await unlinkProjectMutation.mutateAsync({
        goalId,
        projectId,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearVision = () => store.clearVision();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);
  const setViewMode = (viewMode) => store.setViewMode(viewMode);
  const toggleGoalSelection = (id) => store.toggleGoalSelection(id);
  const clearSelection = () => store.clearSelection();
  const setSelectedGoalIds = (ids) => store.setSelectedGoalIds(ids);

  return {
    // State from store
    goals: store.goals,
    currentGoal: store.currentGoal,
    statistics: store.statistics,
    categories: store.categories,
    options: store.options,
    availableProjects: store.availableProjects,
    linkedProjects: store.linkedProjects,
    goalProgress: store.goalProgress,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,
    viewMode: store.viewMode,
    selectedGoalIds: store.selectedGoalIds,

    // Query loading states
    isGoalsLoading: getGoalsQuery({}).isLoading,
    isGoalLoading: getGoalQuery("").isLoading,
    isStatisticsLoading: getStatisticsQuery().isLoading,
    isCategoriesLoading: getCategoriesQuery().isLoading,
    isOptionsLoading: getOptionsQuery().isLoading,
    isProgressLoading: getGoalProgressQuery("").isLoading,
    isAvailableProjectsLoading: getAvailableProjectsQuery("").isLoading,
    isLinkedProjectsLoading: getLinkedProjectsQuery("").isLoading,
    isActivitiesLoading: getActivitiesQuery().isLoading,
    isDashboardLoading: getDashboardQuery().isLoading,

    // Mutation loading states
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isBulkDeleting: bulkDeleteGoalsMutation.isPending,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
    isLinking: linkProjectMutation.isPending,
    isUnlinking: unlinkProjectMutation.isPending,

    // Query methods
    getGoals,
    getGoal,
    getStatistics,
    getCategories,
    getOptions,
    getGoalProgress,
    getAvailableProjects,
    getLinkedProjects,
    getActivities,
    getDashboard,
    getGoalsByStatus,

    // Mutation methods
    createGoal,
    updateGoal,
    deleteGoal,
    bulkDeleteGoals,
    bulkUpdateStatus,
    linkProject,
    unlinkProject,

    // Store actions
    clearError,
    clearVision,
    reset,
    setFilters,
    setViewMode,
    toggleGoalSelection,
    clearSelection,
    setSelectedGoalIds,
  };
};

export default useVision;
