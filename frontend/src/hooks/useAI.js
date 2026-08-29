// src/hooks/useAI.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAIStore } from "../store/aiStore";
import aiService from "../services/aiService";
import {
  askQuestionSchema,
  analyzeProjectSchema,
  summarizeTextSchema,
  generateReportSchema,
  conversationFilterSchema,
  validateForm,
} from "../utils/aiValidation";

export const useAI = () => {
  const queryClient = useQueryClient();
  const store = useAIStore();

  // Query Keys
  const AI_KEYS = {
    conversations: (projectId, params) => [
      "ai",
      "conversations",
      projectId,
      params,
    ],
    conversation: (id) => ["ai", "conversation", id],
    status: ["ai", "status"],
    actions: (projectId) => ["ai", "actions", projectId],
    trends: (projectId) => ["ai", "trends", projectId],
  };

  // ============ Queries ============

  // Get conversations query
  const getConversationsQuery = (projectId, params = {}) => {
    const validatedParams = conversationFilterSchema.cast(params);
    return useQuery({
      queryKey: AI_KEYS.conversations(projectId, validatedParams),
      queryFn: () => aiService.getConversations(projectId, validatedParams),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setConversations(response.data, response.meta);
          store.setPagination({
            page: validatedParams.page || 1,
            limit: validatedParams.limit || 20,
          });
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch conversations");
      },
    });
  };

  // Get single conversation query
  const getConversationQuery = (conversationId) => {
    return useQuery({
      queryKey: AI_KEYS.conversation(conversationId),
      queryFn: () => aiService.getConversation(conversationId),
      enabled: !!conversationId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentConversation(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch conversation");
      },
    });
  };

  // Get AI status query
  const getStatusQuery = () => {
    return useQuery({
      queryKey: AI_KEYS.status,
      queryFn: () => aiService.getStatus(),
      staleTime: 1000 * 60 * 5, // 5 minutes
      onSuccess: (response) => {
        if (response.success) {
          store.setAIStatus(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch AI status");
      },
    });
  };

  // Get next actions query
  const getNextActionsQuery = (projectId) => {
    return useQuery({
      queryKey: AI_KEYS.actions(projectId),
      queryFn: () => aiService.getNextActions(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentActions(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch next actions");
      },
    });
  };

  // Get trends query
  const getTrendsQuery = (projectId) => {
    return useQuery({
      queryKey: AI_KEYS.trends(projectId),
      queryFn: () => aiService.getTrends(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentTrends(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch trends");
      },
    });
  };

  // ============ Mutations ============

  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(askQuestionSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return aiService.askQuestion(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addConversation(response.data);
        // Invalidate conversations query to refresh list
        queryClient.invalidateQueries({
          queryKey: ["ai", "conversations"],
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
      store.setError(message || "Failed to ask question");
    },
  });

  // Analyze project mutation
  const analyzeProjectMutation = useMutation({
    mutationFn: ({ projectId, data = {} }) => {
      return validateForm(analyzeProjectSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return aiService.analyzeProject(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.setCurrentAnalysis(response.data);
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
      store.setError(message || "Failed to analyze project");
    },
  });

  // Summarize text mutation
  const summarizeTextMutation = useMutation({
    mutationFn: (data) => {
      return validateForm(summarizeTextSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return aiService.summarizeText(data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.setCurrentSummary(response.data);
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
      store.setError(message || "Failed to summarize text");
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: ({ projectId, data = {} }) => {
      return validateForm(generateReportSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return aiService.generateReport(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.setCurrentReport(response.data);
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
      store.setError(message || "Failed to generate report");
    },
  });

  // ============ API Methods ============

  const askQuestion = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await askQuestionMutation.mutateAsync({ projectId, data });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const analyzeProject = async (projectId, data = {}) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await analyzeProjectMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const summarizeText = async (data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await summarizeTextMutation.mutateAsync(data);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const generateReport = async (projectId, data = {}) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await generateReportMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const getConversations = (projectId, params = {}) => {
    return getConversationsQuery(projectId, params);
  };

  const getConversation = (conversationId) => {
    return getConversationQuery(conversationId);
  };

  const getStatus = () => {
    return getStatusQuery();
  };

  const getNextActions = (projectId) => {
    return getNextActionsQuery(projectId);
  };

  const getTrends = (projectId) => {
    return getTrendsQuery(projectId);
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearAI = () => store.clearAI();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);

  return {
    // State from store
    conversations: store.conversations,
    currentConversation: store.currentConversation,
    currentAnalysis: store.currentAnalysis,
    currentReport: store.currentReport,
    currentActions: store.currentActions,
    currentTrends: store.currentTrends,
    currentSummary: store.currentSummary,
    aiStatus: store.aiStatus,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,

    // Query loading states
    isConversationsLoading: getConversationsQuery("", {}).isLoading,
    isStatusLoading: getStatusQuery().isLoading,
    isActionsLoading: getNextActionsQuery("").isLoading,
    isTrendsLoading: getTrendsQuery("").isLoading,

    // Mutation loading states
    isAsking: askQuestionMutation.isPending,
    isAnalyzing: analyzeProjectMutation.isPending,
    isSummarizing: summarizeTextMutation.isPending,
    isGeneratingReport: generateReportMutation.isPending,

    // Query methods
    getConversations,
    getConversation,
    getStatus,
    getNextActions,
    getTrends,

    // Mutation methods
    askQuestion,
    analyzeProject,
    summarizeText,
    generateReport,

    // Store actions
    clearError,
    clearAI,
    reset,
    setFilters,
  };
};

export default useAI;
