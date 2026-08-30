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

const VISION_KEYS = {
  goals: (params) => ["vision", "goals", params],
  goal: (id) => ["vision", "goal", id],
  statistics: ["vision", "statistics"],
  categories: ["vision", "categories"],
  options: ["vision", "options"],
  progress: (id) => ["vision", "progress", id],
  availableProjects: (id) => ["vision", "available-projects", id],
};

export const useVision = () => {
  const queryClient = useQueryClient();
  const store = useVisionStore();

  /*
   * --------------------------------------------------
   * QUERIES
   * --------------------------------------------------
   */

  const goalsParams = visionFilterSchema.cast(store.filters || {});

  const goalsQuery = useQuery({
    queryKey: VISION_KEYS.goals(goalsParams),
    queryFn: () => visionService.getGoals(goalsParams),
  });

  const statisticsQuery = useQuery({
    queryKey: VISION_KEYS.statistics,
    queryFn: () => visionService.getStatistics(),
    staleTime: 1000 * 60 * 2,
  });

  const categoriesQuery = useQuery({
    queryKey: VISION_KEYS.categories,
    queryFn: () => visionService.getCategories(),
    staleTime: 1000 * 60 * 5,
  });

  const optionsQuery = useQuery({
    queryKey: VISION_KEYS.options,
    queryFn: () => visionService.getOptions(),
    staleTime: 1000 * 60 * 10,
  });

  /*
   * --------------------------------------------------
   * MUTATIONS
   * --------------------------------------------------
   */

  const createGoalMutation = useMutation({
    mutationFn: async (data) => {
      const validation = await validateForm(visionGoalCreateSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return visionService.createGoal(data);
    },

    onSuccess: (response) => {
      if (response.success) {
        store.addGoal(response.data);

        queryClient.invalidateQueries({
          queryKey: ["vision", "goals"],
        });

        queryClient.invalidateQueries({
          queryKey: VISION_KEYS.statistics,
        });
      }
    },

    onError: (error) => {
      let message = error.message;

      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Keep original message
      }

      store.setError(message || "Failed to create vision goal");
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(visionGoalUpdateSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return visionService.updateGoal(id, data);
    },

    onSuccess: (response) => {
      if (response.success) {
        const id = response.data.id || response.data._id;

        store.updateGoal(id, response.data);

        queryClient.invalidateQueries({
          queryKey: ["vision", "goals"],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "goal", id],
        });

        queryClient.invalidateQueries({
          queryKey: VISION_KEYS.statistics,
        });
      }
    },

    onError: (error) => {
      let message = error.message;

      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Keep original message
      }

      store.setError(message || "Failed to update vision goal");
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id) => visionService.deleteGoal(id),

    onSuccess: (_, id) => {
      store.removeGoal(id);

      queryClient.invalidateQueries({
        queryKey: ["vision", "goals"],
      });

      queryClient.invalidateQueries({
        queryKey: VISION_KEYS.statistics,
      });
    },

    onError: (error) => {
      store.setError(error.message || "Failed to delete vision goal");
    },
  });

  const linkProjectMutation = useMutation({
    mutationFn: async ({ goalId, data }) => {
      const validation = await validateForm(linkProjectSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return visionService.linkProject(goalId, data);
    },

    onSuccess: (response) => {
      if (response.success) {
        const goal = response.data.goal;
        const id = goal.id || goal._id;

        store.updateGoal(id, goal);

        queryClient.invalidateQueries({
          queryKey: ["vision", "goal", id],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "progress", id],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "available-projects", id],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "goals"],
        });
      }
    },

    onError: (error) => {
      let message = error.message;

      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Keep original message
      }

      store.setError(message || "Failed to link project");
    },
  });

  const unlinkProjectMutation = useMutation({
    mutationFn: ({ goalId, projectId }) =>
      visionService.unlinkProject(goalId, projectId),

    onSuccess: (response) => {
      if (response.success) {
        const id = response.data.id || response.data._id;

        store.updateGoal(id, response.data);

        queryClient.invalidateQueries({
          queryKey: ["vision", "goals"],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "goal", id],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "progress", id],
        });

        queryClient.invalidateQueries({
          queryKey: ["vision", "available-projects", id],
        });
      }
    },

    onError: (error) => {
      store.setError(error.message || "Failed to unlink project");
    },
  });

  /*
   * --------------------------------------------------
   * ACTIONS
   * --------------------------------------------------
   */

  const createGoal = async (data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await createGoalMutation.mutateAsync(data);
    } finally {
      store.setLoading(false);
    }
  };

  const updateGoal = async (id, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await updateGoalMutation.mutateAsync({
        id,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await deleteGoalMutation.mutateAsync(id);
    } finally {
      store.setLoading(false);
    }
  };

  const linkProject = async (goalId, data) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await linkProjectMutation.mutateAsync({
        goalId,
        data,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const unlinkProject = async (goalId, projectId) => {
    store.clearError();
    store.setLoading(true);

    try {
      return await unlinkProjectMutation.mutateAsync({
        goalId,
        projectId,
      });
    } finally {
      store.setLoading(false);
    }
  };

  const getGoals = () => {
    store.clearError();

    return queryClient.invalidateQueries({
      queryKey: ["vision", "goals"],
    });
  };

  const getGoal = async (id) => {
    store.clearError();

    return queryClient.fetchQuery({
      queryKey: VISION_KEYS.goal(id),
      queryFn: () => visionService.getGoal(id),
    });
  };

  const getStatistics = () => {
    store.clearError();

    return queryClient.invalidateQueries({
      queryKey: VISION_KEYS.statistics,
    });
  };

  const getCategories = () => {
    store.clearError();

    return queryClient.invalidateQueries({
      queryKey: VISION_KEYS.categories,
    });
  };

  const getOptions = () => {
    store.clearError();

    return queryClient.invalidateQueries({
      queryKey: VISION_KEYS.options,
    });
  };

  const getGoalProgress = async (id) => {
    store.clearError();

    return queryClient.fetchQuery({
      queryKey: VISION_KEYS.progress(id),
      queryFn: () => visionService.getGoalProgress(id),
    });
  };

  const getAvailableProjects = async (id) => {
    store.clearError();

    return queryClient.fetchQuery({
      queryKey: VISION_KEYS.availableProjects(id),
      queryFn: () => visionService.getAvailableProjects(id),
    });
  };

  const clearError = () => store.clearError();
  const clearVision = () => store.clearVision();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  /*
   * --------------------------------------------------
   * STORE + QUERY RESULT SYNC
   * --------------------------------------------------
   */

  useEffectSync(goalsQuery, (response) => {
    if (response?.success) {
      store.setGoals(response.data, response.meta);

      if (response.meta?.statistics) {
        store.setStatistics(response.meta.statistics);
      }
    }
  });

  useEffectSync(statisticsQuery, (response) => {
    if (response?.success) {
      store.setStatistics(response.data);
    }
  });

  useEffectSync(categoriesQuery, (response) => {
    if (response?.success) {
      store.setCategories(response.data);
    }
  });

  useEffectSync(optionsQuery, (response) => {
    if (response?.success) {
      store.setOptions(response.data);
    }
  });

  return {
    // State
    goals: store.goals,
    currentGoal: store.currentGoal,
    statistics: store.statistics,
    categories: store.categories,
    options: store.options,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,

    // Query states
    isGoalsLoading: goalsQuery.isLoading,
    isGoalsFetching: goalsQuery.isFetching,
    isGoalLoading: false,
    isStatisticsLoading: statisticsQuery.isLoading,
    isCategoriesLoading: categoriesQuery.isLoading,
    isOptionsLoading: optionsQuery.isLoading,
    isProgressLoading: false,
    isAvailableProjectsLoading: false,

    // Mutations
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isLinking: linkProjectMutation.isPending,
    isUnlinking: unlinkProjectMutation.isPending,

    // Query actions
    getGoals,
    getGoal,
    getStatistics,
    getCategories,
    getOptions,
    getGoalProgress,
    getAvailableProjects,

    // Mutations
    createGoal,
    updateGoal,
    deleteGoal,
    linkProject,
    unlinkProject,

    // Store actions
    clearError,
    clearVision,
    reset,
    setFilters,
  };
};

/*
 * Keeps React Query results synchronized with Zustand
 * without calling hooks dynamically.
 */
import { useEffect } from "react";

function useEffectSync(query, callback) {
  useEffect(() => {
    if (query.data) {
      callback(query.data);
    }

    if (query.error) {
      // handled below through the query result
    }
  }, [query.data]);
}

export default useVision;
