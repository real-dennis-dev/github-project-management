// src/hooks/useTechDebt.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTechDebtStore } from "../store/techDebtStore";
import techDebtService from "../services/techDebtService";
import {
  techDebtCreateSchema,
  techDebtUpdateSchema,
  techDebtStatusSchema,
  techDebtFilterSchema,
  validateForm,
} from "../utils/techDebtValidation";

export const useTechDebt = () => {
  const queryClient = useQueryClient();
  const store = useTechDebtStore();

  // Query Keys
  const TD_KEYS = {
    items: (projectId, params) => ["techDebt", "items", projectId, params],
    item: (id) => ["techDebt", "item", id],
    overview: (projectId) => ["techDebt", "overview", projectId],
    score: (projectId) => ["techDebt", "score", projectId],
    statistics: (projectId) => ["techDebt", "statistics", projectId],
    suggestions: (projectId) => ["techDebt", "suggestions", projectId],
    globalStats: (params) => ["techDebt", "globalStats", params], // NEW
  };

  // ============ Existing Queries ============

  // Get tech debt items query
  const getItemsQuery = (projectId, params = {}) => {
    const validatedParams = techDebtFilterSchema.cast(params);
    return useQuery({
      queryKey: TD_KEYS.items(projectId, validatedParams),
      queryFn: () => techDebtService.getItems(projectId, validatedParams),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setItems(response.data, response.meta);
          store.setPagination({
            page: validatedParams.page || 1,
            limit: validatedParams.limit || 20,
          });
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch tech debt items");
      },
    });
  };

  // Get single tech debt item query
  const getItemQuery = (id) => {
    return useQuery({
      queryKey: TD_KEYS.item(id),
      queryFn: () => techDebtService.getItem(id),
      enabled: !!id,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentItem(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch tech debt item");
      },
    });
  };

  // Get overview query
  const getOverviewQuery = (projectId) => {
    return useQuery({
      queryKey: TD_KEYS.overview(projectId),
      queryFn: () => techDebtService.getOverview(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setOverview(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch overview");
      },
    });
  };

  // Get score query
  const getScoreQuery = (projectId) => {
    return useQuery({
      queryKey: TD_KEYS.score(projectId),
      queryFn: () => techDebtService.getScore(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setScore(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch score");
      },
    });
  };

  // Get statistics query
  const getStatisticsQuery = (projectId) => {
    return useQuery({
      queryKey: TD_KEYS.statistics(projectId),
      queryFn: () => techDebtService.getStatistics(projectId),
      enabled: !!projectId,
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

  // Get refactoring suggestions query
  const getSuggestionsQuery = (projectId) => {
    return useQuery({
      queryKey: TD_KEYS.suggestions(projectId),
      queryFn: () => techDebtService.getRefactoringSuggestions(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setSuggestions(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch suggestions");
      },
    });
  };

  // ============ NEW: Global Stats Query ============

  /**
   * Get global tech debt statistics across all projects
   * Endpoint: GET /api/tech-debt/stats
   * @param {Object} params - Query parameters (page, limit)
   */
  const getGlobalStatsQuery = (params = {}) => {
    const { page = 1, limit = 20 } = params;
    return useQuery({
      queryKey: TD_KEYS.globalStats({ page, limit }),
      queryFn: () => techDebtService.getGlobalStats({ page, limit }),
      onSuccess: (response) => {
        if (response.success) {
          store.setGlobalStats(response.data);
          // Update pagination if needed
          if (response.data?.latest?.pagination) {
            store.setPagination({
              page: response.data.latest.pagination.page || page,
              limit: response.data.latest.pagination.limit || limit,
              total: response.data.latest.pagination.total || 0,
              pages: response.data.latest.pagination.totalPages || 0,
            });
          }
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch global statistics");
      },
    });
  };

  // ============ Existing Mutations ============

  // Create tech debt item mutation
  const createItemMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(techDebtCreateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return techDebtService.createItem(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addItem(response.data);
        queryClient.invalidateQueries({ queryKey: ["techDebt", "items"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "overview"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "score"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "statistics"] });
        queryClient.invalidateQueries({
          queryKey: ["techDebt", "globalStats"],
        }); // NEW
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
      store.setError(message || "Failed to create tech debt item");
    },
  });

  // Update tech debt item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return validateForm(techDebtUpdateSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return techDebtService.updateItem(id, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateItem(response.data.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["techDebt", "items"] });
        queryClient.invalidateQueries({
          queryKey: ["techDebt", "item", response.data.id],
        });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "overview"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "score"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "statistics"] });
        queryClient.invalidateQueries({
          queryKey: ["techDebt", "globalStats"],
        }); // NEW
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
      store.setError(message || "Failed to update tech debt item");
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return validateForm(techDebtStatusSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return techDebtService.updateStatus(id, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateItem(response.data.id, response.data);
        queryClient.invalidateQueries({ queryKey: ["techDebt", "items"] });
        queryClient.invalidateQueries({
          queryKey: ["techDebt", "item", response.data.id],
        });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "overview"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "score"] });
        queryClient.invalidateQueries({ queryKey: ["techDebt", "statistics"] });
        queryClient.invalidateQueries({
          queryKey: ["techDebt", "globalStats"],
        }); // NEW
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to update status");
    },
  });

  // Delete tech debt item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id) => techDebtService.deleteItem(id),
    onSuccess: (_, id) => {
      store.removeItem(id);
      queryClient.invalidateQueries({ queryKey: ["techDebt", "items"] });
      queryClient.invalidateQueries({ queryKey: ["techDebt", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["techDebt", "score"] });
      queryClient.invalidateQueries({ queryKey: ["techDebt", "statistics"] });
      queryClient.invalidateQueries({ queryKey: ["techDebt", "globalStats"] }); // NEW
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete tech debt item");
    },
  });

  // ============ API Methods ============

  const getItems = (projectId, params = {}) => {
    store.clearError();
    return getItemsQuery(projectId, params);
  };

  const getItem = (id) => {
    store.clearError();
    return getItemQuery(id);
  };

  const getOverview = (projectId) => {
    store.clearError();
    return getOverviewQuery(projectId);
  };

  const getScore = (projectId) => {
    store.clearError();
    return getScoreQuery(projectId);
  };

  const getStatistics = (projectId) => {
    store.clearError();
    return getStatisticsQuery(projectId);
  };

  const getSuggestions = (projectId) => {
    store.clearError();
    return getSuggestionsQuery(projectId);
  };

  // NEW: Get global stats
  const getGlobalStats = (params = {}) => {
    store.clearError();
    return getGlobalStatsQuery(params);
  };

  const createItem = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createItemMutation.mutateAsync({ projectId, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateItem = async (id, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateItemMutation.mutateAsync({ id, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateStatus = async (id, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateStatusMutation.mutateAsync({ id, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteItemMutation.mutateAsync(id);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearTechDebt = () => store.clearTechDebt();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    items: store.items,
    currentItem: store.currentItem,
    overview: store.overview,
    score: store.score,
    statistics: store.statistics,
    globalStats: store.globalStats, // NEW
    suggestions: store.suggestions,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,

    // Query loading states
    isItemsLoading: getItemsQuery("", {}).isLoading,
    isOverviewLoading: getOverviewQuery("").isLoading,
    isScoreLoading: getScoreQuery("").isLoading,
    isStatisticsLoading: getStatisticsQuery("").isLoading,
    isSuggestionsLoading: getSuggestionsQuery("").isLoading,
    isGlobalStatsLoading: getGlobalStatsQuery({}).isLoading, // NEW

    // Mutation loading states
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteItemMutation.isPending,

    // Query methods
    getItems,
    getItem,
    getOverview,
    getScore,
    getStatistics,
    getSuggestions,
    getGlobalStats, // NEW

    // Mutation methods
    createItem,
    updateItem,
    updateStatus,
    deleteItem,

    // Store actions
    clearError,
    clearTechDebt,
    reset,
    setFilters,
  };
};

export default useTechDebt;
