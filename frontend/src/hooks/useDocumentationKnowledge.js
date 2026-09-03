import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useDocumentationKnowledgeStore } from "../store/documentationKnowledgeStore";

import documentationKnowledgeService from "../services/documentationKnowledgeService";

import {
  documentationCreateSchema,
  documentationUpdateSchema,
  knowledgeCreateSchema,
  knowledgeUpdateSchema,
  validateForm,
} from "../utils/documentationKnowledgeValidation";

/**
 * =========================================================
 * QUERY KEYS
 * =========================================================
 */

const DK_KEYS = {
  documentation: (projectId, params) => ["documentation", projectId, params],

  documentationItem: (id) => ["documentation", "item", id],

  knowledge: (params) => ["knowledge", params],

  knowledgeItem: (id) => ["knowledge", "item", id],

  categories: ["knowledge", "categories"],

  stats: (params) => ["documentation-knowledge", "stats", params],

  documentationSearch: (projectId, params) => [
    "documentation",
    "search",
    projectId,
    params,
  ],

  knowledgeSearch: (params) => ["knowledge", "search", params],
};

/**
 * =========================================================
 * HOOK
 * =========================================================
 */

export const useDocumentationKnowledge = ({
  projectId,
  documentationParams = {},
  knowledgeParams = {},
  statsParams = {},
  searchDocumentationParams = null,
  searchKnowledgeParams = null,
} = {}) => {
  const queryClient = useQueryClient();

  /**
   * ---------------------------------------------------------
   * ZUSTAND STORE
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * We don't call Zustand setters from React Query `select`.
   * `select` must remain pure.
   *
   * Zustand is used here for local/shared UI state and
   * mutations can update it safely inside event callbacks.
   */

  const documentation = useDocumentationKnowledgeStore(
    (state) => state.documentation
  );

  const currentDocumentation = useDocumentationKnowledgeStore(
    (state) => state.currentDocumentation
  );

  const knowledgeEntries = useDocumentationKnowledgeStore(
    (state) => state.knowledgeEntries
  );

  const currentKnowledge = useDocumentationKnowledgeStore(
    (state) => state.currentKnowledge
  );

  const categories = useDocumentationKnowledgeStore(
    (state) => state.categories
  );

  const stats = useDocumentationKnowledgeStore((state) => state.stats);

  const recentItems = useDocumentationKnowledgeStore(
    (state) => state.recentItems
  );

  const pagination = useDocumentationKnowledgeStore(
    (state) => state.pagination
  );

  const filters = useDocumentationKnowledgeStore((state) => state.filters);

  const searchResults = useDocumentationKnowledgeStore(
    (state) => state.searchResults
  );

  const isSearchingStore = useDocumentationKnowledgeStore(
    (state) => state.isSearching
  );

  const error = useDocumentationKnowledgeStore((state) => state.error);

  /**
   * Zustand actions
   */

  const setDocumentation = useDocumentationKnowledgeStore(
    (state) => state.setDocumentation
  );

  const setCurrentDocumentation = useDocumentationKnowledgeStore(
    (state) => state.setCurrentDocumentation
  );

  const addDocumentation = useDocumentationKnowledgeStore(
    (state) => state.addDocumentation
  );

  const updateDocumentationStore = useDocumentationKnowledgeStore(
    (state) => state.updateDocumentation
  );

  const removeDocumentation = useDocumentationKnowledgeStore(
    (state) => state.removeDocumentation
  );

  const setKnowledgeEntries = useDocumentationKnowledgeStore(
    (state) => state.setKnowledgeEntries
  );

  const setCurrentKnowledge = useDocumentationKnowledgeStore(
    (state) => state.setCurrentKnowledge
  );

  const addKnowledgeEntry = useDocumentationKnowledgeStore(
    (state) => state.addKnowledgeEntry
  );

  const updateKnowledgeEntryStore = useDocumentationKnowledgeStore(
    (state) => state.updateKnowledgeEntry
  );

  const removeKnowledgeEntry = useDocumentationKnowledgeStore(
    (state) => state.removeKnowledgeEntry
  );

  const setCategories = useDocumentationKnowledgeStore(
    (state) => state.setCategories
  );

  const setStats = useDocumentationKnowledgeStore((state) => state.setStats);

  const setRecentItems = useDocumentationKnowledgeStore(
    (state) => state.setRecentItems
  );

  const setSearchResults = useDocumentationKnowledgeStore(
    (state) => state.setSearchResults
  );

  const clearSearchStore = useDocumentationKnowledgeStore(
    (state) => state.clearSearch
  );

  const clearError = useDocumentationKnowledgeStore(
    (state) => state.clearError
  );

  const setError = useDocumentationKnowledgeStore((state) => state.setError);

  const setPagination = useDocumentationKnowledgeStore(
    (state) => state.setPagination
  );

  const setFilters = useDocumentationKnowledgeStore(
    (state) => state.setFilters
  );

  const clearAll = useDocumentationKnowledgeStore((state) => state.clearAll);

  const reset = useDocumentationKnowledgeStore((state) => state.reset);

  /**
   * =========================================================
   * DOCUMENTATION QUERY
   * =========================================================
   */

  const documentationQuery = useQuery({
    queryKey: DK_KEYS.documentation(projectId, documentationParams),

    queryFn: () =>
      documentationKnowledgeService.getDocumentation(
        projectId,
        documentationParams
      ),

    enabled: Boolean(projectId),

    staleTime: 30_000,

    placeholderData: (previousData) => previousData,
  });

  /**
   * Sync query → Zustand AFTER render.
   *
   * This is safe because useEffect runs after React finishes
   * rendering.
   */

  useEffect(() => {
    const response = documentationQuery.data;

    if (!response?.success) {
      return;
    }

    setDocumentation(response.data || [], response.meta);
  }, [documentationQuery.data, setDocumentation]);

  /**
   * =========================================================
   * DOCUMENTATION ITEM QUERY
   * =========================================================
   */

  const documentationItemId = currentDocumentation?.id;

  const documentationItemQuery = useQuery({
    queryKey: DK_KEYS.documentationItem(documentationItemId),

    queryFn: () =>
      documentationKnowledgeService.getDocumentationById(documentationItemId),

    enabled: Boolean(documentationItemId),

    staleTime: 30_000,
  });

  useEffect(() => {
    const response = documentationItemQuery.data;

    if (!response?.success) {
      return;
    }

    setCurrentDocumentation(response.data);
  }, [documentationItemQuery.data, setCurrentDocumentation]);

  /**
   * =========================================================
   * KNOWLEDGE QUERY
   * =========================================================
   */

  const knowledgeQuery = useQuery({
    queryKey: DK_KEYS.knowledge(knowledgeParams),

    queryFn: () =>
      documentationKnowledgeService.getKnowledgeEntries(knowledgeParams),

    enabled: true,

    staleTime: 30_000,

    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    const response = knowledgeQuery.data;

    if (!response?.success) {
      return;
    }

    setKnowledgeEntries(response.data || [], response.meta);
  }, [knowledgeQuery.data, setKnowledgeEntries]);

  /**
   * =========================================================
   * KNOWLEDGE ITEM QUERY
   * =========================================================
   */

  const knowledgeItemId = currentKnowledge?.id;

  const knowledgeItemQuery = useQuery({
    queryKey: DK_KEYS.knowledgeItem(knowledgeItemId),

    queryFn: () =>
      documentationKnowledgeService.getKnowledgeById(knowledgeItemId),

    enabled: Boolean(knowledgeItemId),

    staleTime: 30_000,
  });

  useEffect(() => {
    const response = knowledgeItemQuery.data;

    if (!response?.success) {
      return;
    }

    setCurrentKnowledge(response.data);
  }, [knowledgeItemQuery.data, setCurrentKnowledge]);

  /**
   * =========================================================
   * CATEGORIES
   * =========================================================
   */

  const categoriesQuery = useQuery({
    queryKey: DK_KEYS.categories,

    queryFn: () => documentationKnowledgeService.getCategories(),

    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const response = categoriesQuery.data;

    if (!response?.success) {
      return;
    }

    setCategories(response.data || []);
  }, [categoriesQuery.data, setCategories]);

  /**
   * =========================================================
   * DASHBOARD STATS
   * =========================================================
   */

  const dashboardStatsQuery = useQuery({
    queryKey: DK_KEYS.stats(statsParams),

    queryFn: () => documentationKnowledgeService.getDashboardStats(statsParams),

    staleTime: 2 * 60 * 1000,

    placeholderData: (previousData) => previousData,
  });

  /**
   * Sync dashboard stats after render.
   */

  useEffect(() => {
    const response = dashboardStatsQuery.data;

    if (!response?.success) {
      return;
    }

    setStats(response.data?.stats || null);

    setRecentItems(response.data?.items || []);

    setPagination({
      total: response.meta?.pagination?.total || 0,

      pages: response.meta?.pagination?.pages || 0,
    });
  }, [dashboardStatsQuery.data, setStats, setRecentItems, setPagination]);

  /**
   * =========================================================
   * SEARCH QUERIES
   * =========================================================
   *
   * These queries are useful when search parameters are
   * provided directly to the hook.
   */

  const documentationSearchQuery = useQuery({
    queryKey: DK_KEYS.documentationSearch(projectId, searchDocumentationParams),

    queryFn: () =>
      documentationKnowledgeService.searchDocumentation(
        projectId,
        searchDocumentationParams
      ),

    enabled: Boolean(projectId) && Boolean(searchDocumentationParams),

    staleTime: 30_000,
  });

  const knowledgeSearchQuery = useQuery({
    queryKey: DK_KEYS.knowledgeSearch(searchKnowledgeParams),

    queryFn: () =>
      documentationKnowledgeService.searchKnowledge(searchKnowledgeParams),

    enabled: Boolean(searchKnowledgeParams),

    staleTime: 30_000,
  });

  /**
   * =========================================================
   * SEARCH METHODS
   * =========================================================
   *
   * These methods use queryClient.fetchQuery().
   *
   * This means the dashboard can do:
   *
   * await searchDocumentation(...)
   * await searchKnowledge(...)
   *
   * without creating setState calls during rendering.
   */

  const searchDocumentation = useCallback(
    async (searchProjectId, params = {}) => {
      const queryKey = DK_KEYS.documentationSearch(searchProjectId, params);

      return queryClient.fetchQuery({
        queryKey,

        queryFn: () =>
          documentationKnowledgeService.searchDocumentation(
            searchProjectId,
            params
          ),

        staleTime: 30_000,
      });
    },
    [queryClient]
  );

  const searchKnowledge = useCallback(
    async (params = {}) => {
      const queryKey = DK_KEYS.knowledgeSearch(params);

      return queryClient.fetchQuery({
        queryKey,

        queryFn: () => documentationKnowledgeService.searchKnowledge(params),

        staleTime: 30_000,
      });
    },
    [queryClient]
  );

  /**
   * =========================================================
   * MUTATIONS
   * =========================================================
   */

  const createDocumentationMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(documentationCreateSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return documentationKnowledgeService.createDocumentation(projectId, data);
    },

    onSuccess: (response) => {
      if (!response?.success) {
        return;
      }

      addDocumentation(response.data);

      queryClient.invalidateQueries({
        queryKey: ["documentation"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documentation-knowledge", "stats"],
      });
    },
  });

  const updateDocumentationMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(documentationUpdateSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return documentationKnowledgeService.updateDocumentation(id, data);
    },

    onSuccess: (response) => {
      if (!response?.success) {
        return;
      }

      updateDocumentationStore(response.data.id, response.data);

      queryClient.invalidateQueries({
        queryKey: ["documentation"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documentation-knowledge", "stats"],
      });
    },
  });

  const deleteDocumentationMutation = useMutation({
    mutationFn: (id) => documentationKnowledgeService.deleteDocumentation(id),

    onSuccess: (_, id) => {
      removeDocumentation(id);

      queryClient.invalidateQueries({
        queryKey: ["documentation"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documentation-knowledge", "stats"],
      });
    },
  });

  const createKnowledgeMutation = useMutation({
    mutationFn: async (data) => {
      const validation = await validateForm(knowledgeCreateSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return documentationKnowledgeService.createKnowledgeEntry(data);
    },

    onSuccess: (response) => {
      if (!response?.success) {
        return;
      }

      addKnowledgeEntry(response.data);

      queryClient.invalidateQueries({
        queryKey: ["knowledge"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documentation-knowledge", "stats"],
      });
    },
  });

  const updateKnowledgeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(knowledgeUpdateSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return documentationKnowledgeService.updateKnowledgeEntry(id, data);
    },

    onSuccess: (response) => {
      if (!response?.success) {
        return;
      }

      updateKnowledgeEntryStore(response.data.id, response.data);

      queryClient.invalidateQueries({
        queryKey: ["knowledge"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documentation-knowledge", "stats"],
      });
    },
  });

  const deleteKnowledgeMutation = useMutation({
    mutationFn: (id) => documentationKnowledgeService.deleteKnowledgeEntry(id),

    onSuccess: (_, id) => {
      removeKnowledgeEntry(id);

      queryClient.invalidateQueries({
        queryKey: ["knowledge"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documentation-knowledge", "stats"],
      });
    },
  });

  /**
   * =========================================================
   * ERROR HANDLING
   * =========================================================
   */

  const getErrorMessage = useCallback((error) => {
    if (!error) {
      return null;
    }

    try {
      const errors = JSON.parse(error.message);

      return Object.values(errors).join(", ");
    } catch {
      return error.message || "Something went wrong";
    }
  }, []);

  /**
   * =========================================================
   * API METHODS
   * =========================================================
   */

  const createDocumentation = useCallback(
    async (projectId, data) => {
      clearError();

      try {
        return await createDocumentationMutation.mutateAsync({
          projectId,
          data,
        });
      } catch (error) {
        setError(getErrorMessage(error) || "Failed to create documentation");

        throw error;
      }
    },
    [clearError, setError, getErrorMessage, createDocumentationMutation]
  );

  const updateDocumentation = useCallback(
    async (id, data) => {
      clearError();

      try {
        return await updateDocumentationMutation.mutateAsync({
          id,
          data,
        });
      } catch (error) {
        setError(getErrorMessage(error) || "Failed to update documentation");

        throw error;
      }
    },
    [clearError, setError, getErrorMessage, updateDocumentationMutation]
  );

  const deleteDocumentation = useCallback(
    async (id) => {
      clearError();

      try {
        return await deleteDocumentationMutation.mutateAsync(id);
      } catch (error) {
        setError(getErrorMessage(error) || "Failed to delete documentation");

        throw error;
      }
    },
    [clearError, setError, getErrorMessage, deleteDocumentationMutation]
  );

  const createKnowledge = useCallback(
    async (data) => {
      clearError();

      try {
        return await createKnowledgeMutation.mutateAsync(data);
      } catch (error) {
        setError(getErrorMessage(error) || "Failed to create knowledge entry");

        throw error;
      }
    },
    [clearError, setError, getErrorMessage, createKnowledgeMutation]
  );

  const updateKnowledge = useCallback(
    async (id, data) => {
      clearError();

      try {
        return await updateKnowledgeMutation.mutateAsync({
          id,
          data,
        });
      } catch (error) {
        setError(getErrorMessage(error) || "Failed to update knowledge entry");

        throw error;
      }
    },
    [clearError, setError, getErrorMessage, updateKnowledgeMutation]
  );

  const deleteKnowledge = useCallback(
    async (id) => {
      clearError();

      try {
        return await deleteKnowledgeMutation.mutateAsync(id);
      } catch (error) {
        setError(getErrorMessage(error) || "Failed to delete knowledge entry");

        throw error;
      }
    },
    [clearError, setError, getErrorMessage, deleteKnowledgeMutation]
  );

  /**
   * =========================================================
   * COMBINED SEARCH
   * =========================================================
   *
   * This is particularly useful for your dashboard.
   *
   * It searches documentation + knowledge simultaneously,
   * combines the results, and puts them in the Zustand store.
   */

  const search = useCallback(
    async (query, options = {}) => {
      const trimmedQuery = query?.trim();

      if (!trimmedQuery || trimmedQuery.length < 2) {
        clearSearchStore();

        return [];
      }

      const { documentationLimit = 10, knowledgeLimit = 10 } = options;

      try {
        const [documentationResponse, knowledgeResponse] = await Promise.all([
          searchDocumentation(projectId, {
            query: trimmedQuery,
            limit: documentationLimit,
          }),

          searchKnowledge({
            query: trimmedQuery,
            limit: knowledgeLimit,
          }),
        ]);

        const documentationResults =
          documentationResponse?.data?.data ||
          documentationResponse?.data ||
          [];

        const knowledgeResults =
          knowledgeResponse?.data?.data || knowledgeResponse?.data || [];

        const combined = [
          ...documentationResults.map((item) => ({
            ...item,
            type: "documentation",
          })),

          ...knowledgeResults.map((item) => ({
            ...item,
            type: "knowledge",
          })),
        ];

        setSearchResults(combined);

        return combined;
      } catch (error) {
        setError(getErrorMessage(error) || "Search failed");

        throw error;
      }
    },
    [
      projectId,
      searchDocumentation,
      searchKnowledge,
      setSearchResults,
      clearSearchStore,
      setError,
      getErrorMessage,
    ]
  );

  /**
   * =========================================================
   * RETURN
   * =========================================================
   */

  return {
    /**
     * Store state
     */

    documentation,

    currentDocumentation,

    knowledgeEntries,

    currentKnowledge,

    categories,

    stats,

    recentItems,

    pagination,

    filters,

    searchResults,

    error,

    /**
     * Query states
     */

    isDocumentationLoading: documentationQuery.isLoading,

    isDocumentationFetching: documentationQuery.isFetching,

    isDocumentationError: documentationQuery.isError,

    documentationError: documentationQuery.error,

    isDocumentationItemLoading: documentationItemQuery.isLoading,

    isDocumentationItemFetching: documentationItemQuery.isFetching,

    isKnowledgeLoading: knowledgeQuery.isLoading,

    isKnowledgeFetching: knowledgeQuery.isFetching,

    isKnowledgeError: knowledgeQuery.isError,

    knowledgeError: knowledgeQuery.error,

    isKnowledgeItemLoading: knowledgeItemQuery.isLoading,

    isCategoriesLoading: categoriesQuery.isLoading,

    isStatsLoading: dashboardStatsQuery.isLoading,

    isStatsFetching: dashboardStatsQuery.isFetching,

    statsError: dashboardStatsQuery.error,

    /**
     * Direct search query results
     */

    documentationSearchResults:
      documentationSearchQuery.data?.data ||
      documentationSearchQuery.data ||
      [],

    knowledgeSearchResults:
      knowledgeSearchQuery.data?.data || knowledgeSearchQuery.data || [],

    isDocumentationSearching: documentationSearchQuery.isFetching,

    isKnowledgeSearching: knowledgeSearchQuery.isFetching,

    /**
     * Combined search state
     */

    isSearching:
      isSearchingStore ||
      documentationSearchQuery.isFetching ||
      knowledgeSearchQuery.isFetching,

    /**
     * Search methods
     */

    searchDocumentation,

    searchKnowledge,

    search,

    /**
     * Mutations
     */

    isCreatingDocumentation: createDocumentationMutation.isPending,

    isUpdatingDocumentation: updateDocumentationMutation.isPending,

    isDeletingDocumentation: deleteDocumentationMutation.isPending,

    isCreatingKnowledge: createKnowledgeMutation.isPending,

    isUpdatingKnowledge: updateKnowledgeMutation.isPending,

    isDeletingKnowledge: deleteKnowledgeMutation.isPending,

    /**
     * Mutation methods
     */

    createDocumentation,

    updateDocumentation,

    deleteDocumentation,

    createKnowledge,

    updateKnowledge,

    deleteKnowledge,

    /**
     * Store methods
     */

    clearError,

    clearAll,

    reset,

    setFilters,

    clearSearch: clearSearchStore,

    /**
     * Refetch methods
     */

    refetchDocumentation: documentationQuery.refetch,

    refetchKnowledge: knowledgeQuery.refetch,

    refetchCategories: categoriesQuery.refetch,

    refetchStats: dashboardStatsQuery.refetch,
  };
};

export default useDocumentationKnowledge;
