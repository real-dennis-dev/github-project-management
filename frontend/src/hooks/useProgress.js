// src/hooks/useProgress.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProgressStore } from "../store/progressStore";
import progressService from "../services/progressService";
import {
  timelineEntrySchema,
  updateTimelineEntrySchema,
  timelineFilterSchema,
  monthlyProgressSchema,
  bulkEntrySchema,
  validateForm,
} from "../utils/progressValidation";

export const useProgress = () => {
  const queryClient = useQueryClient();
  const store = useProgressStore();

  // Query Keys
  const PROGRESS_KEYS = {
    timeline: (projectId, params) => [
      "progress",
      "timeline",
      projectId,
      params,
    ],
    overview: (projectId, months) => [
      "progress",
      "overview",
      projectId,
      months,
    ],
    monthly: (projectId, params) => ["progress", "monthly", projectId, params],
    report: (projectId, params) => ["progress", "report", projectId, params],
  };

  // ============ Queries ============

  // Get timeline query
  const getTimelineQuery = (projectId, params = {}) => {
    const validatedParams = timelineFilterSchema.cast(params);
    return useQuery({
      queryKey: PROGRESS_KEYS.timeline(projectId, validatedParams),
      queryFn: () => progressService.getTimeline(projectId, validatedParams),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setTimelineEntries(response.data, response.pagination);
          store.setFilters({
            page: validatedParams.page || 1,
            limit: validatedParams.limit || 20,
            sortBy: validatedParams.sort_by || "month_year",
            sortOrder: validatedParams.sort_order || "asc",
          });
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch timeline");
      },
    });
  };

  // Get progress overview query
  const getProgressOverviewQuery = (projectId, months = 12) => {
    return useQuery({
      queryKey: PROGRESS_KEYS.overview(projectId, months),
      queryFn: () => progressService.getProgressOverview(projectId, months),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setProgressOverview(response.data);
          if (response.data.overview) {
            store.setStats({
              total: response.data.overview.totalFeatures || 0,
              average: response.data.overview.average || 0,
              completed: response.data.overview.completedFeatures || 0,
              inProgress:
                response.data.overview.totalFeatures -
                  response.data.overview.completedFeatures || 0,
            });
          }
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch progress overview");
      },
    });
  };

  // Get monthly progress query
  const getMonthlyProgressQuery = (projectId, params = {}) => {
    const validatedParams = monthlyProgressSchema.cast(params);
    return useQuery({
      queryKey: PROGRESS_KEYS.monthly(projectId, validatedParams),
      queryFn: () =>
        progressService.getMonthlyProgress(projectId, validatedParams),
      enabled: !!projectId && !!params.month,
      onSuccess: (response) => {
        if (response.success) {
          store.setMonthlyProgress(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch monthly progress");
      },
    });
  };

  // Get progress report query
  const getProgressReportQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: PROGRESS_KEYS.report(projectId, params),
      queryFn: () => progressService.getProgressReport(projectId, params),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setProgressReport(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to generate report");
      },
    });
  };

  // ============ Mutations ============

  // Add timeline entry mutation
  const addTimelineEntryMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(timelineEntrySchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return progressService.addTimelineEntry(projectId, data);
      });
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        store.addTimelineEntry(response.data);
        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: ["progress", "timeline", variables.projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["progress", "overview", variables.projectId],
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
      store.setError(message || "Failed to add timeline entry");
    },
  });

  // Update timeline entry mutation
  const updateTimelineEntryMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return validateForm(updateTimelineEntrySchema, data).then(
        (validation) => {
          if (!validation.isValid) {
            throw new Error(JSON.stringify(validation.errors));
          }
          return progressService.updateTimelineEntry(id, data);
        }
      );
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateTimelineEntry(response.data);
        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: ["progress", "timeline"],
        });
        queryClient.invalidateQueries({
          queryKey: ["progress", "overview"],
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
      store.setError(message || "Failed to update timeline entry");
    },
  });

  // Delete timeline entry mutation
  const deleteTimelineEntryMutation = useMutation({
    mutationFn: (id) => progressService.deleteTimelineEntry(id),
    onSuccess: (response) => {
      if (response.success) {
        store.removeTimelineEntry(response.data.id);
        queryClient.invalidateQueries({
          queryKey: ["progress", "timeline"],
        });
        queryClient.invalidateQueries({
          queryKey: ["progress", "overview"],
        });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete timeline entry");
    },
  });

  // Bulk add timeline entries mutation
  const bulkAddTimelineEntriesMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(bulkEntrySchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return progressService.bulkAddTimelineEntries(projectId, data);
      });
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["progress", "timeline", variables.projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["progress", "overview", variables.projectId],
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
      store.setError(message || "Failed to bulk add entries");
    },
  });

  // ============ API Methods ============

  const getTimeline = (projectId, params = {}) => {
    return getTimelineQuery(projectId, params);
  };

  const getProgressOverview = (projectId, months = 12) => {
    return getProgressOverviewQuery(projectId, months);
  };

  const getMonthlyProgress = (projectId, params = {}) => {
    return getMonthlyProgressQuery(projectId, params);
  };

  const getProgressReport = (projectId, params = {}) => {
    return getProgressReportQuery(projectId, params);
  };

  const addTimelineEntry = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await addTimelineEntryMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateTimelineEntry = async (id, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateTimelineEntryMutation.mutateAsync({
        id,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteTimelineEntry = async (id) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteTimelineEntryMutation.mutateAsync(id);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const bulkAddTimelineEntries = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await bulkAddTimelineEntriesMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearProgress = () => store.clearProgress();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);
  const setPagination = (pagination) => store.setPagination(pagination);

  return {
    // State from store
    timelineEntries: store.timelineEntries,
    currentEntry: store.currentEntry,
    progressOverview: store.progressOverview,
    monthlyProgress: store.monthlyProgress,
    progressReport: store.progressReport,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,
    stats: store.stats,

    // Query loading states
    isTimelineLoading: getTimelineQuery("", {}).isLoading,
    isOverviewLoading: getProgressOverviewQuery("").isLoading,
    isMonthlyLoading: getMonthlyProgressQuery("", { month: null }).isLoading,
    isReportLoading: getProgressReportQuery("").isLoading,

    // Mutation loading states
    isAdding: addTimelineEntryMutation.isPending,
    isUpdating: updateTimelineEntryMutation.isPending,
    isDeleting: deleteTimelineEntryMutation.isPending,
    isBulkAdding: bulkAddTimelineEntriesMutation.isPending,

    // Query methods
    getTimeline,
    getProgressOverview,
    getMonthlyProgress,
    getProgressReport,

    // Mutation methods
    addTimelineEntry,
    updateTimelineEntry,
    deleteTimelineEntry,
    bulkAddTimelineEntries,

    // Store actions
    clearError,
    clearProgress,
    reset,
    setFilters,
    setPagination,
  };
};

export default useProgress;
