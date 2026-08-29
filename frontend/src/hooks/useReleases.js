// src/hooks/useReleases.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReleasesStore } from "../store/releasesStore";
import releasesService from "../services/releasesService";
import {
  createReleaseSchema,
  updateReleaseSchema,
  releaseStatusSchema,
  addFeaturesSchema,
  releaseFilterSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  milestoneStatusSchema,
  milestoneFilterSchema,
  bulkUpdateSchema,
  validateForm,
} from "../utils/releasesValidation";

export const useReleases = () => {
  const queryClient = useQueryClient();
  const store = useReleasesStore();

  // Query Keys
  const RELEASE_KEYS = {
    releases: (projectId, params) => ["releases", projectId, params],
    release: (id) => ["release", id],
    releaseProgress: (id) => ["release", "progress", id],
    releaseChangelog: (id) => ["release", "changelog", id],
    releaseStats: (projectId) => ["releases", "stats", projectId],
    milestones: (projectId, params) => ["milestones", projectId, params],
    milestone: (id) => ["milestone", id],
    milestoneProgress: (id) => ["milestone", "progress", id],
    overdueMilestones: (projectId) => ["milestones", "overdue", projectId],
    milestoneStats: (projectId) => ["milestones", "stats", projectId],
  };

  // ============ Release Queries ============

  const getReleasesQuery = (projectId, params = {}) => {
    const validatedParams = releaseFilterSchema.cast(params);
    return useQuery({
      queryKey: RELEASE_KEYS.releases(projectId, validatedParams),
      queryFn: () => releasesService.getReleases(projectId, validatedParams),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setReleases(response.data, response.meta);
          store.setFilters(validatedParams);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch releases");
      },
    });
  };

  const getReleaseQuery = (releaseId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.release(releaseId),
      queryFn: () => releasesService.getRelease(releaseId),
      enabled: !!releaseId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentRelease(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch release");
      },
    });
  };

  const getReleaseProgressQuery = (releaseId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.releaseProgress(releaseId),
      queryFn: () => releasesService.getReleaseProgress(releaseId),
      enabled: !!releaseId,
      onSuccess: (response) => {
        if (response.success) {
          store.setReleaseProgress(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch release progress");
      },
    });
  };

  const getReleaseChangelogQuery = (releaseId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.releaseChangelog(releaseId),
      queryFn: () => releasesService.getReleaseChangelog(releaseId),
      enabled: !!releaseId,
      onSuccess: (response) => {
        if (response.success) {
          store.setChangelog(response.data.changelog);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch changelog");
      },
    });
  };

  const getReleaseStatsQuery = (projectId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.releaseStats(projectId),
      queryFn: () => releasesService.getReleaseStatistics(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setReleaseStats(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch release statistics");
      },
    });
  };

  // ============ Milestone Queries ============

  const getMilestonesQuery = (projectId, params = {}) => {
    const validatedParams = milestoneFilterSchema.cast(params);
    return useQuery({
      queryKey: RELEASE_KEYS.milestones(projectId, validatedParams),
      queryFn: () => releasesService.getMilestones(projectId, validatedParams),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setMilestones(response.data, response.meta);
          store.setMilestoneFilters(validatedParams);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch milestones");
      },
    });
  };

  const getMilestoneQuery = (milestoneId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.milestone(milestoneId),
      queryFn: () => releasesService.getMilestone(milestoneId),
      enabled: !!milestoneId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentMilestone(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch milestone");
      },
    });
  };

  const getMilestoneProgressQuery = (milestoneId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.milestoneProgress(milestoneId),
      queryFn: () => releasesService.getMilestoneProgress(milestoneId),
      enabled: !!milestoneId,
      onSuccess: (response) => {
        if (response.success) {
          store.setMilestoneProgress(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch milestone progress");
      },
    });
  };

  const getOverdueMilestonesQuery = (projectId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.overdueMilestones(projectId),
      queryFn: () => releasesService.getOverdueMilestones(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setOverdueMilestones(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch overdue milestones");
      },
    });
  };

  const getMilestoneStatsQuery = (projectId) => {
    return useQuery({
      queryKey: RELEASE_KEYS.milestoneStats(projectId),
      queryFn: () => releasesService.getMilestoneStatistics(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setMilestoneStats(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch milestone statistics");
      },
    });
  };

  // ============ Release Mutations ============

  const createReleaseMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(createReleaseSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.createRelease(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addRelease(response.data);
        queryClient.invalidateQueries({ queryKey: ["releases"] });
        queryClient.invalidateQueries({ queryKey: ["releases", "stats"] });
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
      store.setError(message || "Failed to create release");
    },
  });

  const updateReleaseMutation = useMutation({
    mutationFn: ({ releaseId, data }) => {
      return validateForm(updateReleaseSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.updateRelease(releaseId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateRelease(response.data);
        queryClient.invalidateQueries({ queryKey: ["releases"] });
        queryClient.invalidateQueries({
          queryKey: ["release", response.data.id],
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
      store.setError(message || "Failed to update release");
    },
  });

  const deleteReleaseMutation = useMutation({
    mutationFn: (releaseId) => releasesService.deleteRelease(releaseId),
    onSuccess: (response) => {
      if (response.success) {
        store.removeRelease(response.data?.id);
        queryClient.invalidateQueries({ queryKey: ["releases"] });
        queryClient.invalidateQueries({ queryKey: ["releases", "stats"] });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete release");
    },
  });

  const updateReleaseStatusMutation = useMutation({
    mutationFn: ({ releaseId, data }) => {
      return validateForm(releaseStatusSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.updateReleaseStatus(releaseId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateRelease(response.data);
        queryClient.invalidateQueries({ queryKey: ["releases"] });
        queryClient.invalidateQueries({
          queryKey: ["release", response.data.id],
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
      store.setError(message || "Failed to update release status");
    },
  });

  const addFeaturesMutation = useMutation({
    mutationFn: ({ releaseId, data }) => {
      return validateForm(addFeaturesSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.addFeaturesToRelease(releaseId, data);
      });
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["release", variables.releaseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["release", "progress", variables.releaseId],
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
      store.setError(message || "Failed to add features to release");
    },
  });

  const removeFeatureMutation = useMutation({
    mutationFn: ({ releaseId, featureId }) =>
      releasesService.removeFeatureFromRelease(releaseId, featureId),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: ["release", variables.releaseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["release", "progress", variables.releaseId],
        });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to remove feature from release");
    },
  });

  // ============ Milestone Mutations ============

  const createMilestoneMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(createMilestoneSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.createMilestone(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addMilestone(response.data);
        queryClient.invalidateQueries({ queryKey: ["milestones"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "overdue"] });
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
      store.setError(message || "Failed to create milestone");
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, data }) => {
      return validateForm(updateMilestoneSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.updateMilestone(milestoneId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateMilestone(response.data);
        queryClient.invalidateQueries({ queryKey: ["milestones"] });
        queryClient.invalidateQueries({
          queryKey: ["milestone", response.data.id],
        });
        queryClient.invalidateQueries({ queryKey: ["milestones", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "overdue"] });
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
      store.setError(message || "Failed to update milestone");
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId) => releasesService.deleteMilestone(milestoneId),
    onSuccess: (response) => {
      if (response.success) {
        store.removeMilestone(response.data?.id);
        queryClient.invalidateQueries({ queryKey: ["milestones"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "overdue"] });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete milestone");
    },
  });

  const updateMilestoneStatusMutation = useMutation({
    mutationFn: ({ milestoneId, data }) => {
      return validateForm(milestoneStatusSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.updateMilestoneStatus(milestoneId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateMilestone(response.data);
        queryClient.invalidateQueries({ queryKey: ["milestones"] });
        queryClient.invalidateQueries({
          queryKey: ["milestone", response.data.id],
        });
        queryClient.invalidateQueries({ queryKey: ["milestones", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "overdue"] });
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
      store.setError(message || "Failed to update milestone status");
    },
  });

  const bulkUpdateMilestonesMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(bulkUpdateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return releasesService.bulkUpdateMilestones(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.bulkUpdateMilestones(response.data);
        queryClient.invalidateQueries({ queryKey: ["milestones"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["milestones", "overdue"] });
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
      store.setError(message || "Failed to bulk update milestones");
    },
  });

  // ============ API Methods ============

  // Release methods
  const createRelease = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createReleaseMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateRelease = async (releaseId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateReleaseMutation.mutateAsync({
        releaseId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteRelease = async (releaseId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteReleaseMutation.mutateAsync(releaseId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateReleaseStatus = async (releaseId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateReleaseStatusMutation.mutateAsync({
        releaseId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const addFeatures = async (releaseId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await addFeaturesMutation.mutateAsync({ releaseId, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const removeFeature = async (releaseId, featureId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await removeFeatureMutation.mutateAsync({
        releaseId,
        featureId,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // Milestone methods
  const createMilestone = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createMilestoneMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateMilestone = async (milestoneId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateMilestoneMutation.mutateAsync({
        milestoneId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteMilestone = async (milestoneId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteMilestoneMutation.mutateAsync(milestoneId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateMilestoneStatusMutation.mutateAsync({
        milestoneId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const bulkUpdateMilestones = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await bulkUpdateMilestonesMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Query Methods ============

  const getReleases = (projectId, params = {}) => {
    return getReleasesQuery(projectId, params);
  };

  const getRelease = (releaseId) => {
    return getReleaseQuery(releaseId);
  };

  const getReleaseProgress = (releaseId) => {
    return getReleaseProgressQuery(releaseId);
  };

  const getReleaseChangelog = (releaseId) => {
    return getReleaseChangelogQuery(releaseId);
  };

  const getReleaseStats = (projectId) => {
    return getReleaseStatsQuery(projectId);
  };

  const getMilestones = (projectId, params = {}) => {
    return getMilestonesQuery(projectId, params);
  };

  const getMilestone = (milestoneId) => {
    return getMilestoneQuery(milestoneId);
  };

  const getMilestoneProgress = (milestoneId) => {
    return getMilestoneProgressQuery(milestoneId);
  };

  const getOverdueMilestones = (projectId) => {
    return getOverdueMilestonesQuery(projectId);
  };

  const getMilestoneStats = (projectId) => {
    return getMilestoneStatsQuery(projectId);
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearReleases = () => store.clearReleases();
  const clearMilestones = () => store.clearMilestones();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);
  const setMilestoneFilters = (filters) => store.setMilestoneFilters(filters);
  const setPagination = (pagination) => store.setPagination(pagination);

  return {
    // State from store
    releases: store.releases,
    currentRelease: store.currentRelease,
    releaseStats: store.releaseStats,
    releaseProgress: store.releaseProgress,
    changelog: store.changelog,
    milestones: store.milestones,
    currentMilestone: store.currentMilestone,
    milestoneStats: store.milestoneStats,
    milestoneProgress: store.milestoneProgress,
    overdueMilestones: store.overdueMilestones,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,
    milestoneFilters: store.milestoneFilters,

    // Query loading states
    isReleasesLoading: getReleasesQuery("", {}).isLoading,
    isReleaseLoading: getReleaseQuery("").isLoading,
    isReleaseProgressLoading: getReleaseProgressQuery("").isLoading,
    isChangelogLoading: getReleaseChangelogQuery("").isLoading,
    isReleaseStatsLoading: getReleaseStatsQuery("").isLoading,
    isMilestonesLoading: getMilestonesQuery("", {}).isLoading,
    isMilestoneLoading: getMilestoneQuery("").isLoading,
    isMilestoneProgressLoading: getMilestoneProgressQuery("").isLoading,
    isOverdueLoading: getOverdueMilestonesQuery("").isLoading,
    isMilestoneStatsLoading: getMilestoneStatsQuery("").isLoading,

    // Mutation loading states
    isCreatingRelease: createReleaseMutation.isPending,
    isUpdatingRelease: updateReleaseMutation.isPending,
    isDeletingRelease: deleteReleaseMutation.isPending,
    isUpdatingReleaseStatus: updateReleaseStatusMutation.isPending,
    isAddingFeatures: addFeaturesMutation.isPending,
    isRemovingFeature: removeFeatureMutation.isPending,
    isCreatingMilestone: createMilestoneMutation.isPending,
    isUpdatingMilestone: updateMilestoneMutation.isPending,
    isDeletingMilestone: deleteMilestoneMutation.isPending,
    isUpdatingMilestoneStatus: updateMilestoneStatusMutation.isPending,
    isBulkUpdating: bulkUpdateMilestonesMutation.isPending,

    // Query methods
    getReleases,
    getRelease,
    getReleaseProgress,
    getReleaseChangelog,
    getReleaseStats,
    getMilestones,
    getMilestone,
    getMilestoneProgress,
    getOverdueMilestones,
    getMilestoneStats,

    // Mutation methods
    createRelease,
    updateRelease,
    deleteRelease,
    updateReleaseStatus,
    addFeatures,
    removeFeature,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
    bulkUpdateMilestones,

    // Store actions
    clearError,
    clearReleases,
    clearMilestones,
    reset,
    setFilters,
    setMilestoneFilters,
    setPagination,
  };
};

export default useReleases;
