// src/hooks/useDecisionRisk.js
import { useState, useEffect, useCallback } from "react";
import { decisionService, riskService } from "../services/decisionRiskService";

// Constants
export const IMPACT_LEVELS = ["low", "medium", "high", "critical"];
export const RISK_LEVELS = ["low", "medium", "high", "critical"];
export const RISK_STATUSES = [
  "identified",
  "monitoring",
  "mitigated",
  "realized",
  "closed",
];

const getImpactColor = (impact) => {
  const colors = {
    low: "text-green-600 bg-green-100",
    medium: "text-yellow-600 bg-yellow-100",
    high: "text-orange-600 bg-orange-100",
    critical: "text-red-600 bg-red-100",
  };
  return colors[impact] || colors.medium;
};

const getRiskLevelColor = (level) => {
  const colors = {
    low: "text-green-600 bg-green-100",
    medium: "text-yellow-600 bg-yellow-100",
    high: "text-orange-600 bg-orange-100",
    critical: "text-red-600 bg-red-100",
  };
  return colors[level] || colors.medium;
};

const getRiskStatusColor = (status) => {
  const colors = {
    identified: "text-blue-600 bg-blue-100",
    monitoring: "text-yellow-600 bg-yellow-100",
    mitigated: "text-green-600 bg-green-100",
    realized: "text-red-600 bg-red-100",
    closed: "text-gray-600 bg-gray-100",
  };
  return colors[status] || colors.identified;
};

const getRiskStatusBadge = (status) => {
  const badges = {
    identified: "Identified",
    monitoring: "Monitoring",
    mitigated: "Mitigated",
    realized: "Realized",
    closed: "Closed",
  };
  return badges[status] || status;
};

/**
 * Hook for managing decisions
 */
export const useDecisions = (projectId, initialParams = {}) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchDecisions = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await decisionService.getDecisions(projectId, {
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success) {
        setDecisions(response.data);
        if (response.meta?.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.meta.pagination,
          }));
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch decisions");
    } finally {
      setLoading(false);
    }
  }, [projectId, params, pagination.page, pagination.limit]);

  const fetchStatistics = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await decisionService.getDecisionStatistics(projectId);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch decision statistics:", err);
    }
  }, [projectId]);

  const createDecision = useCallback(
    async (data) => {
      if (!projectId) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await decisionService.createDecision(projectId, data);
        if (response.success) {
          await fetchDecisions();
          await fetchStatistics();
          return response.data;
        }
      } catch (err) {
        setError(err.message || "Failed to create decision");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchDecisions, fetchStatistics]
  );

  const updateDecision = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await decisionService.updateDecision(id, data);
        if (response.success) {
          await fetchDecisions();
          await fetchStatistics();
          return response.data;
        }
      } catch (err) {
        setError(err.message || "Failed to update decision");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchDecisions, fetchStatistics]
  );

  const deleteDecision = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const response = await decisionService.deleteDecision(id);
        if (response.success) {
          await fetchDecisions();
          await fetchStatistics();
          return true;
        }
      } catch (err) {
        setError(err.message || "Failed to delete decision");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchDecisions, fetchStatistics]
  );

  const exportDecisions = useCallback(
    async (format = "json") => {
      if (!projectId) return null;

      try {
        const response = await decisionService.exportDecisions(
          projectId,
          format
        );
        return response;
      } catch (err) {
        setError(err.message || "Failed to export decisions");
        return null;
      }
    },
    [projectId]
  );

  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    decisions,
    loading,
    error,
    pagination,
    statistics,
    params,
    fetchDecisions,
    fetchStatistics,
    createDecision,
    updateDecision,
    deleteDecision,
    exportDecisions,
    changePage,
    changeLimit,
    updateParams,
    setParams,
    getImpactColor,
  };
};

/**
 * Hook for managing risks
 */
export const useRisks = (projectId, initialParams = {}) => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [riskScore, setRiskScore] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [riskMatrix, setRiskMatrix] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchRisks = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await riskService.getRisks(projectId, {
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success) {
        setRisks(response.data);
        if (response.meta?.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.meta.pagination,
          }));
        }
      }
    } catch (err) {
      setError(err.message || "Failed to fetch risks");
    } finally {
      setLoading(false);
    }
  }, [projectId, params, pagination.page, pagination.limit]);

  const fetchRiskScore = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await riskService.getRiskScore(projectId);
      if (response.success) {
        setRiskScore(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch risk score:", err);
    }
  }, [projectId]);

  const fetchRiskReport = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await riskService.getRiskReport(projectId);
      if (response.success) {
        setRiskReport(response);
      }
    } catch (err) {
      console.error("Failed to fetch risk report:", err);
    }
  }, [projectId]);

  const fetchRiskMatrix = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await riskService.getRiskMatrix(projectId);
      if (response.success) {
        setRiskMatrix(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch risk matrix:", err);
    }
  }, [projectId]);

  const createRisk = useCallback(
    async (data) => {
      if (!projectId) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await riskService.createRisk(projectId, data);
        if (response.success) {
          await fetchRisks();
          await fetchRiskScore();
          return response.data;
        }
      } catch (err) {
        setError(err.message || "Failed to create risk");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchRisks, fetchRiskScore]
  );

  const updateRisk = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await riskService.updateRisk(id, data);
        if (response.success) {
          await fetchRisks();
          await fetchRiskScore();
          return response.data;
        }
      } catch (err) {
        setError(err.message || "Failed to update risk");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchRisks, fetchRiskScore]
  );

  const updateRiskStatus = useCallback(
    async (id, status) => {
      setLoading(true);
      setError(null);

      try {
        const response = await riskService.updateRiskStatus(id, status);
        if (response.success) {
          await fetchRisks();
          await fetchRiskScore();
          return response.data;
        }
      } catch (err) {
        setError(err.message || "Failed to update risk status");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchRisks, fetchRiskScore]
  );

  const deleteRisk = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const response = await riskService.deleteRisk(id);
        if (response.success) {
          await fetchRisks();
          await fetchRiskScore();
          return true;
        }
      } catch (err) {
        setError(err.message || "Failed to delete risk");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchRisks, fetchRiskScore]
  );

  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  useEffect(() => {
    fetchRiskScore();
  }, [fetchRiskScore]);

  return {
    risks,
    loading,
    error,
    pagination,
    riskScore,
    riskReport,
    riskMatrix,
    params,
    fetchRisks,
    fetchRiskScore,
    fetchRiskReport,
    fetchRiskMatrix,
    createRisk,
    updateRisk,
    updateRiskStatus,
    deleteRisk,
    changePage,
    changeLimit,
    updateParams,
    setParams,
    getRiskLevelColor,
    getRiskStatusColor,
    getRiskStatusBadge,
  };
};

// Export helper functions
export {
  getImpactColor,
  getRiskLevelColor,
  getRiskStatusColor,
  getRiskStatusBadge,
};
