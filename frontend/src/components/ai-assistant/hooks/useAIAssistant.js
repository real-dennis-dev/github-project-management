// src/components/ai-assistant/hooks/useAIAssistant.js
import { useState, useCallback, useRef } from "react";
import aiService from "../services/aiService";

export const useAIAssistant = (projectId) => {
  const [conversations, setConversations] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [report, setReport] = useState(null);
  const [trends, setTrends] = useState(null);
  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const abortControllerRef = useRef(null);

  // Helper to handle API calls with abort
  const withAbort = useCallback(async (apiCall) => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(abortControllerRef.current.signal);
      return result;
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "An error occurred");
        throw err;
      }
      return null;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Get AI assistant status
  const getStatus = useCallback(async () => {
    try {
      const response = await aiService.getStatus();
      setStatus(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to get AI status");
      throw err;
    }
  }, []);

  // Ask a question
  const askQuestion = useCallback(
    async (question, context = {}) => {
      if (!projectId) {
        setError("Project ID is required");
        return;
      }

      try {
        const response = await withAbort(async (signal) => {
          return await aiService.askQuestion(
            projectId,
            question,
            context,
            signal
          );
        });

        if (response) {
          setCurrentResponse(response.data);
          return response.data;
        }
      } catch (err) {
        // Error handled in withAbort
        throw err;
      }
    },
    [projectId, withAbort]
  );

  // Analyze project
  const analyzeProject = useCallback(
    async (focus = "overall", depth = "standard") => {
      if (!projectId) {
        setError("Project ID is required");
        return;
      }

      try {
        const response = await withAbort(async (signal) => {
          return await aiService.analyzeProject(
            projectId,
            { focus, depth },
            signal
          );
        });

        if (response) {
          setAnalysis(response.data);
          return response.data;
        }
      } catch (err) {
        throw err;
      }
    },
    [projectId, withAbort]
  );

  // Generate report
  const generateReport = useCallback(
    async (type = "comprehensive", options = {}) => {
      if (!projectId) {
        setError("Project ID is required");
        return;
      }

      try {
        const response = await withAbort(async (signal) => {
          return await aiService.generateReport(
            projectId,
            { type, ...options },
            signal
          );
        });

        if (response) {
          setReport(response.data);
          return response.data;
        }
      } catch (err) {
        throw err;
      }
    },
    [projectId, withAbort]
  );

  // Get trends
  const getTrends = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is required");
      return;
    }

    try {
      const response = await withAbort(async (signal) => {
        return await aiService.getTrends(projectId, signal);
      });

      if (response) {
        setTrends(response.data);
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  }, [projectId, withAbort]);

  // Get next actions
  const getNextActions = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is required");
      return;
    }

    try {
      const response = await withAbort(async (signal) => {
        return await aiService.getNextActions(projectId, signal);
      });

      if (response) {
        setActions(response.data);
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  }, [projectId, withAbort]);

  // Get conversation history
  const getConversationHistory = useCallback(
    async (params = {}) => {
      if (!projectId) {
        setError("Project ID is required");
        return;
      }

      try {
        const response = await withAbort(async (signal) => {
          return await aiService.getConversations(projectId, params, signal);
        });

        if (response) {
          setConversations(response.data || []);
          return response.data;
        }
      } catch (err) {
        throw err;
      }
    },
    [projectId, withAbort]
  );

  // Clear response
  const clearResponse = useCallback(() => {
    setCurrentResponse(null);
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    setError(null);
    setCurrentResponse(null);
    // Optionally clear other states
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    setConversations([]);
    setCurrentResponse(null);
    setAnalysis(null);
    setReport(null);
    setTrends(null);
    setActions(null);
    setError(null);
    setStatus(null);
  }, []);

  return {
    // State
    conversations,
    currentResponse,
    analysis,
    report,
    trends,
    actions,
    loading,
    error,
    status,

    // Actions
    askQuestion,
    analyzeProject,
    generateReport,
    getTrends,
    getNextActions,
    getConversationHistory,
    getStatus,
    clearResponse,
    resetState,
    clearAll,
  };
};

export default useAIAssistant;
