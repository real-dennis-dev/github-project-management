// src/hooks/useAI.js
import { useEffect } from "react";
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

export const useAI = () => {
  const queryClient = useQueryClient();

  // IMPORTANT:
  // Subscribe only to the specific Zustand values needed.
  // Do NOT use: const store = useAIStore();
  const conversations = useAIStore((state) => state.conversations);
  const currentConversation = useAIStore((state) => state.currentConversation);
  const currentAnalysis = useAIStore((state) => state.currentAnalysis);
  const currentReport = useAIStore((state) => state.currentReport);
  const currentActions = useAIStore((state) => state.currentActions);
  const currentTrends = useAIStore((state) => state.currentTrends);
  const currentSummary = useAIStore((state) => state.currentSummary);
  const aiStatus = useAIStore((state) => state.aiStatus);
  const isLoading = useAIStore((state) => state.isLoading);
  const error = useAIStore((state) => state.error);
  const pagination = useAIStore((state) => state.pagination);
  const filters = useAIStore((state) => state.filters);

  // Stable actions
  const addConversation = useAIStore((state) => state.addConversation);
  const setCurrentAnalysis = useAIStore((state) => state.setCurrentAnalysis);
  const setCurrentReport = useAIStore((state) => state.setCurrentReport);
  const setCurrentConversation = useAIStore(
    (state) => state.setCurrentConversation
  );
  const setCurrentSummary = useAIStore((state) => state.setCurrentSummary);
  const setConversations = useAIStore((state) => state.setConversations);
  const setAIStatus = useAIStore((state) => state.setAIStatus);
  const setCurrentActions = useAIStore((state) => state.setCurrentActions);
  const setCurrentTrends = useAIStore((state) => state.setCurrentTrends);
  const setLoading = useAIStore((state) => state.setLoading);
  const setError = useAIStore((state) => state.setError);
  const clearError = useAIStore((state) => state.clearError);
  const clearAI = useAIStore((state) => state.clearAI);
  const reset = useAIStore((state) => state.reset);
  const setFilters = useAIStore((state) => state.setFilters);

  // ==================== QUERIES ====================

  const projectId = filters?.projectId || "";

  const conversationsQuery = useQuery({
    queryKey: AI_KEYS.conversations(projectId, filters || {}),
    queryFn: () =>
      aiService.getConversations(
        filters?.projectId,
        conversationFilterSchema.cast(filters || {})
      ),
    enabled: !!filters?.projectId,
  });

  const statusQuery = useQuery({
    queryKey: AI_KEYS.status,
    queryFn: () => aiService.getStatus(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const actionsQuery = useQuery({
    queryKey: AI_KEYS.actions(projectId),
    queryFn: () => aiService.getNextActions(projectId),
    enabled: !!projectId,
  });

  const trendsQuery = useQuery({
    queryKey: AI_KEYS.trends(projectId),
    queryFn: () => aiService.getTrends(projectId),
    enabled: !!projectId,
  });

  // ==================== MUTATIONS ====================

  const askQuestionMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(askQuestionSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return aiService.askQuestion(projectId, data);
    },

    onSuccess: (response) => {
      if (response?.success) {
        addConversation(response.data);

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
      } catch {}

      setError(message || "Failed to ask question");
    },
  });

  const analyzeProjectMutation = useMutation({
    mutationFn: async ({ projectId, data = {} }) => {
      const validation = await validateForm(analyzeProjectSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return aiService.analyzeProject(projectId, data);
    },

    onSuccess: (response) => {
      if (response?.success) {
        setCurrentAnalysis(response.data);
      }
    },

    onError: (error) => {
      let message = error.message;

      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {}

      setError(message || "Failed to analyze project");
    },
  });

  const summarizeTextMutation = useMutation({
    mutationFn: async (data) => {
      const validation = await validateForm(summarizeTextSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return aiService.summarizeText(data);
    },

    onSuccess: (response) => {
      if (response?.success) {
        setCurrentSummary(response.data);
      }
    },

    onError: (error) => {
      let message = error.message;

      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {}

      setError(message || "Failed to summarize text");
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async ({ projectId, data = {} }) => {
      const validation = await validateForm(generateReportSchema, data);

      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }

      return aiService.generateReport(projectId, data);
    },

    onSuccess: (response) => {
      if (response?.success) {
        setCurrentReport(response.data);
      }
    },

    onError: (error) => {
      let message = error.message;

      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {}

      setError(message || "Failed to generate report");
    },
  });

  // ==================== API METHODS ====================

  const askQuestion = async (projectId, data) => {
    clearError();
    setLoading(true);

    try {
      return await askQuestionMutation.mutateAsync({
        projectId,
        data,
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeProject = async (projectId, data = {}) => {
    clearError();
    setLoading(true);

    try {
      return await analyzeProjectMutation.mutateAsync({
        projectId,
        data,
      });
    } finally {
      setLoading(false);
    }
  };

  const summarizeText = async (data) => {
    clearError();
    setLoading(true);

    try {
      return await summarizeTextMutation.mutateAsync(data);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (projectId, data = {}) => {
    clearError();
    setLoading(true);

    try {
      return await generateReportMutation.mutateAsync({
        projectId,
        data,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== QUERY METHODS ====================

  const getStatus = () => statusQuery.refetch();

  const getConversations = () => conversationsQuery.refetch();

  const getNextActions = () => actionsQuery.refetch();

  const getTrends = () => trendsQuery.refetch();

  const getConversation = async (conversationId) => {
    if (!conversationId) return null;

    const result = await queryClient.fetchQuery({
      queryKey: AI_KEYS.conversation(conversationId),
      queryFn: () => aiService.getConversation(conversationId),
    });

    if (result?.success) {
      setCurrentConversation(result.data);
    }

    return result;
  };

  // ==================== REACT QUERY -> ZUSTAND SYNC ====================

  useEffect(() => {
    if (!conversationsQuery.data?.success) return;

    const data = conversationsQuery.data.data;

    if (data?.conversations) {
      setConversations(data.conversations, conversationsQuery.data.meta);
    }
  }, [conversationsQuery.data, setConversations]);

  useEffect(() => {
    if (conversationsQuery.error) {
      setError(
        conversationsQuery.error.message || "Failed to fetch conversations"
      );
    }
  }, [conversationsQuery.error, setError]);

  useEffect(() => {
    if (!statusQuery.data?.success) return;

    const data = statusQuery.data.data;

    if (data?.isFallback !== undefined) {
      setAIStatus(data);
    }
  }, [statusQuery.data, setAIStatus]);

  useEffect(() => {
    if (statusQuery.error) {
      setError(statusQuery.error.message || "Failed to fetch AI status");
    }
  }, [statusQuery.error, setError]);

  useEffect(() => {
    if (!actionsQuery.data?.success) return;

    const data = actionsQuery.data.data;

    if (data?.actions) {
      setCurrentActions(data.actions);
    }
  }, [actionsQuery.data, setCurrentActions]);

  useEffect(() => {
    if (actionsQuery.error) {
      setError(actionsQuery.error.message || "Failed to fetch AI actions");
    }
  }, [actionsQuery.error, setError]);

  useEffect(() => {
    if (!trendsQuery.data?.success) return;

    const data = trendsQuery.data.data;

    if (data?.trends) {
      setCurrentTrends(data.trends);
    }
  }, [trendsQuery.data, setCurrentTrends]);

  useEffect(() => {
    if (trendsQuery.error) {
      setError(trendsQuery.error.message || "Failed to fetch AI trends");
    }
  }, [trendsQuery.error, setError]);

  return {
    // State
    conversations,
    currentConversation,
    currentAnalysis,
    currentReport,
    currentActions,
    currentTrends,
    currentSummary,
    aiStatus,
    isLoading,
    error,
    pagination,
    filters,

    // Query states
    isConversationsLoading: conversationsQuery.isLoading,
    isStatusLoading: statusQuery.isLoading,
    isActionsLoading: actionsQuery.isLoading,
    isTrendsLoading: trendsQuery.isLoading,

    // Mutation states
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
