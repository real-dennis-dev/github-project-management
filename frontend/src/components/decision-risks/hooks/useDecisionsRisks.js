// src/components/decision-risks/hooks/useDecisionsRisks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDecisionsRisksStore } from "../store/decisionsRisksStore";
import { decisionsRisksService } from "../services/decisionsRisksService";
import { validateForm } from "../utils/decisionsRisksValidation";
import {
  decisionCreateSchema,
  decisionUpdateSchema,
  riskCreateSchema,
  riskUpdateSchema,
  riskStatusUpdateSchema,
  decisionFilterSchema,
  riskFilterSchema,
} from "../utils/decisionsRisksValidation";

export const useDecisionsRisks = () => {
  const queryClient = useQueryClient();
  const store = useDecisionsRisksStore();

  // ========== Query Keys ==========
  const QUERY_KEYS = {
    decisions: (projectId, filters) => ["decisions", projectId, filters],
    decision: (id) => ["decision", id],
    decisionStats: (projectId) => ["decisionStats", projectId],
    risks: (projectId, filters) => ["risks", projectId, filters],
    risk: (id) => ["risk", id],
    riskReport: (projectId) => ["riskReport", projectId],
    riskScore: (projectId) => ["riskScore", projectId],
    riskMatrix: (projectId) => ["riskMatrix", projectId],
    risksByStatus: (projectId, status) => ["risksByStatus", projectId, status],
  };

  // ========== Query States ==========
  const isDecisionsLoading = useQuery({
    queryKey: QUERY_KEYS.decisions(
      store.decisionFilters?.projectId,
      store.decisionFilters
    ),
    queryFn: async () => {
      const response = await decisionsRisksService.getDecisions(
        store.decisionFilters.projectId,
        store.decisionFilters
      );
      store.setDecisions(response.data, response.meta);
      return response;
    },
    enabled: !!store.decisionFilters?.projectId,
    staleTime: 1000 * 60,
  }).isLoading;

  const isRisksLoading = useQuery({
    queryKey: QUERY_KEYS.risks(store.riskFilters?.projectId, store.riskFilters),
    queryFn: async () => {
      const response = await decisionsRisksService.getRisks(
        store.riskFilters.projectId,
        store.riskFilters
      );
      store.setRisks(response.data, response.meta);
      return response;
    },
    enabled: !!store.riskFilters?.projectId,
    staleTime: 1000 * 60,
  }).isLoading;

  // ========== Decision Mutations ==========

  const createDecisionMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(decisionCreateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return decisionsRisksService.createDecision(projectId, data);
    },
    onSuccess: (response, { projectId }) => {
      store.addDecision(response.data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisions(projectId, store.decisionFilters),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisionStats(projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  const updateDecisionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(decisionUpdateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return decisionsRisksService.updateDecision(id, data);
    },
    onSuccess: (response) => {
      store.updateDecision(response.data.id, response.data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decision(response.data.id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisions(
          store.decisionFilters?.projectId,
          store.decisionFilters
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisionStats(store.decisionFilters?.projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  const deleteDecisionMutation = useMutation({
    mutationFn: async (id) => {
      return decisionsRisksService.deleteDecision(id);
    },
    onSuccess: (_, id) => {
      store.removeDecision(id);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisions(
          store.decisionFilters?.projectId,
          store.decisionFilters
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisionStats(store.decisionFilters?.projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  // ========== Risk Mutations ==========

  const createRiskMutation = useMutation({
    mutationFn: async ({ projectId, data }) => {
      const validation = await validateForm(riskCreateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return decisionsRisksService.createRisk(projectId, data);
    },
    onSuccess: (response, { projectId }) => {
      store.addRisk(response.data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risks(projectId, store.riskFilters),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskScore(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskMatrix(projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  const updateRiskMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(riskUpdateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return decisionsRisksService.updateRisk(id, data);
    },
    onSuccess: (response) => {
      store.updateRisk(response.data.id, response.data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risk(response.data.id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risks(
          store.riskFilters?.projectId,
          store.riskFilters
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskScore(store.riskFilters?.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskMatrix(store.riskFilters?.projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  const updateRiskStatusMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(riskStatusUpdateSchema, data);
      if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
      }
      return decisionsRisksService.updateRiskStatus(id, data);
    },
    onSuccess: (response) => {
      store.updateRisk(response.data.id, response.data);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risk(response.data.id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risks(
          store.riskFilters?.projectId,
          store.riskFilters
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskScore(store.riskFilters?.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskMatrix(store.riskFilters?.projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  const deleteRiskMutation = useMutation({
    mutationFn: async (id) => {
      return decisionsRisksService.deleteRisk(id);
    },
    onSuccess: (_, id) => {
      store.removeRisk(id);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risks(
          store.riskFilters?.projectId,
          store.riskFilters
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskScore(store.riskFilters?.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.riskMatrix(store.riskFilters?.projectId),
      });
    },
    onError: (error) => {
      store.setError(error.message);
    },
  });

  // ========== Helper Methods ==========

  const fetchDecision = useQuery({
    queryKey: QUERY_KEYS.decision,
    queryFn: async (id) => {
      const response = await decisionsRisksService.getDecision(id);
      store.setCurrentDecision(response.data);
      return response;
    },
    enabled: false,
  });

  const fetchRisk = useQuery({
    queryKey: QUERY_KEYS.risk,
    queryFn: async (id) => {
      const response = await decisionsRisksService.getRisk(id);
      store.setCurrentRisk(response.data);
      return response;
    },
    enabled: false,
  });

  const fetchDecisionStats = useQuery({
    queryKey: QUERY_KEYS.decisionStats(store.decisionFilters?.projectId),
    queryFn: async () => {
      const response = await decisionsRisksService.getDecisionStats(
        store.decisionFilters.projectId
      );
      store.setDecisionStats(response.data);
      return response;
    },
    enabled: !!store.decisionFilters?.projectId,
    staleTime: 1000 * 60 * 5,
  });

  const fetchRiskReport = useQuery({
    queryKey: QUERY_KEYS.riskReport(store.riskFilters?.projectId),
    queryFn: async () => {
      const response = await decisionsRisksService.getRiskReport(
        store.riskFilters.projectId
      );
      store.setRiskReport(response.data);
      return response;
    },
    enabled: !!store.riskFilters?.projectId,
    staleTime: 1000 * 60 * 5,
  });

  const fetchRiskScore = useQuery({
    queryKey: QUERY_KEYS.riskScore(store.riskFilters?.projectId),
    queryFn: async () => {
      const response = await decisionsRisksService.getRiskScore(
        store.riskFilters.projectId
      );
      store.setRiskScore(response.data);
      return response;
    },
    enabled: !!store.riskFilters?.projectId,
    staleTime: 1000 * 60 * 5,
  });

  const fetchRiskMatrix = useQuery({
    queryKey: QUERY_KEYS.riskMatrix(store.riskFilters?.projectId),
    queryFn: async () => {
      const response = await decisionsRisksService.getRiskMatrix(
        store.riskFilters.projectId
      );
      store.setRiskMatrix(response.data);
      return response;
    },
    enabled: !!store.riskFilters?.projectId,
    staleTime: 1000 * 60 * 5,
  });

  // ========== Return ==========
  return {
    // State
    ...store,
    isDecisionsLoading,
    isRisksLoading,

    // Query methods
    fetchDecision: (id) =>
      fetchDecision.refetch({ queryKey: QUERY_KEYS.decision(id) }),
    fetchRisk: (id) => fetchRisk.refetch({ queryKey: QUERY_KEYS.risk(id) }),
    refetchDecisions: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.decisions(
          store.decisionFilters?.projectId,
          store.decisionFilters
        ),
      });
    },
    refetchRisks: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.risks(
          store.riskFilters?.projectId,
          store.riskFilters
        ),
      });
    },

    // Decision mutation methods
    createDecision: async (projectId, data) => {
      const result = await createDecisionMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    },
    updateDecision: async (id, data) => {
      const result = await updateDecisionMutation.mutateAsync({ id, data });
      return result;
    },
    deleteDecision: async (id) => {
      const result = await deleteDecisionMutation.mutateAsync(id);
      return result;
    },

    // Risk mutation methods
    createRisk: async (projectId, data) => {
      const result = await createRiskMutation.mutateAsync({ projectId, data });
      return result;
    },
    updateRisk: async (id, data) => {
      const result = await updateRiskMutation.mutateAsync({ id, data });
      return result;
    },
    updateRiskStatus: async (id, data) => {
      const result = await updateRiskStatusMutation.mutateAsync({ id, data });
      return result;
    },
    deleteRisk: async (id) => {
      const result = await deleteRiskMutation.mutateAsync(id);
      return result;
    },

    // Mutation states
    isCreatingDecision: createDecisionMutation.isPending,
    isUpdatingDecision: updateDecisionMutation.isPending,
    isDeletingDecision: deleteDecisionMutation.isPending,
    isCreatingRisk: createRiskMutation.isPending,
    isUpdatingRisk: updateRiskMutation.isPending,
    isUpdatingRiskStatus: updateRiskStatusMutation.isPending,
    isDeletingRisk: deleteRiskMutation.isPending,

    // Fetch methods
    fetchDecisionStats: () => fetchDecisionStats.refetch(),
    fetchRiskReport: () => fetchRiskReport.refetch(),
    fetchRiskScore: () => fetchRiskScore.refetch(),
    fetchRiskMatrix: () => fetchRiskMatrix.refetch(),

    // Filter methods
    setDecisionFilters: (filters) => {
      store.setDecisionFilters(filters);
    },
    setRiskFilters: (filters) => {
      store.setRiskFilters(filters);
    },
    resetDecisionFilters: store.resetDecisionFilters,
    resetRiskFilters: store.resetRiskFilters,

    // Clear
    clearError: store.clearError,
    clearAll: store.clearAll,
  };
};

export default useDecisionsRisks;
