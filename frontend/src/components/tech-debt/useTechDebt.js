// src/components/tech-debt/useTechDebt.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import techDebtService from "./TechDebtService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  getPriority,
  getPriorityLabel,
  getPriorityColor,
  getPriorityIcon,
  getStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  getScoreLevel,
} from "./TechDebtConstants";

/**
 * Custom hook for tech debt management
 */
export const useTechDebt = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [overview, setOverview] = useState(null);
  const [score, setScore] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  /**
   * Fetch tech debt items with current filters and pagination
   */
  const fetchItems = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await techDebtService.getTechDebtItems(
        projectId,
        params
      );

      if (response.success) {
        setItems(response.data || []);
        if (response.meta) {
          setPagination((prev) => ({
            ...prev,
            ...response.meta.pagination,
          }));
        }
      } else {
        throw new Error(response.message || "Failed to fetch tech debt items");
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching tech debt items"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    projectId,
    filters,
    pagination.page,
    pagination.limit,
    sortBy,
    sortOrder,
  ]);

  /**
   * Fetch tech debt overview
   */
  const fetchOverview = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await techDebtService.getTechDebtOverview(projectId);
      if (response.success) {
        setOverview(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    }
  }, [projectId]);

  /**
   * Fetch tech debt score
   */
  const fetchScore = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await techDebtService.getTechDebtScore(projectId);
      if (response.success) {
        setScore(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch score:", err);
    }
  }, [projectId]);

  /**
   * Fetch tech debt statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await techDebtService.getTechDebtStatistics(projectId);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  }, [projectId]);

  /**
   * Fetch refactoring suggestions
   */
  const fetchSuggestions = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await techDebtService.getRefactoringSuggestions(
        projectId
      );
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  }, [projectId]);

  /**
   * Create a new tech debt item
   */
  const createItem = useCallback(
    async (techDebtData) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await techDebtService.createTechDebt(
          projectId,
          techDebtData
        );

        if (response.success) {
          await fetchItems();
          await fetchOverview();
          await fetchScore();
          await fetchStatistics();
          return response.data;
        } else {
          throw new Error(
            response.message || "Failed to create tech debt item"
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while creating the tech debt item"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchItems, fetchOverview, fetchScore, fetchStatistics]
  );

  /**
   * Update a tech debt item
   */
  const updateItem = useCallback(
    async (techDebtId, techDebtData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await techDebtService.updateTechDebt(
          techDebtId,
          techDebtData
        );

        if (response.success) {
          await fetchItems();
          await fetchOverview();
          await fetchScore();
          await fetchStatistics();
          return response.data;
        } else {
          throw new Error(
            response.message || "Failed to update tech debt item"
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while updating the tech debt item"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchItems, fetchOverview, fetchScore, fetchStatistics]
  );

  /**
   * Update tech debt status
   */
  const updateStatus = useCallback(
    async (techDebtId, status) => {
      setLoading(true);
      setError(null);

      try {
        const response = await techDebtService.updateStatus(techDebtId, status);

        if (response.success) {
          await fetchItems();
          await fetchOverview();
          await fetchScore();
          await fetchStatistics();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update status");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchItems, fetchOverview, fetchScore, fetchStatistics]
  );

  /**
   * Delete a tech debt item
   */
  const deleteItem = useCallback(
    async (techDebtId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await techDebtService.deleteTechDebt(techDebtId);

        if (response.success) {
          await fetchItems();
          await fetchOverview();
          await fetchScore();
          await fetchStatistics();
          return true;
        } else {
          throw new Error(
            response.message || "Failed to delete tech debt item"
          );
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while deleting the tech debt item"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchItems, fetchOverview, fetchScore, fetchStatistics]
  );

  /**
   * Get a single tech debt item by ID
   */
  const getItemById = useCallback(async (techDebtId) => {
    if (!techDebtId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await techDebtService.getTechDebtById(techDebtId);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch tech debt item");
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching the tech debt item"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export tech debt items
   */
  const exportItems = useCallback(
    async (format = "json") => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await techDebtService.exportTechDebt(
          projectId,
          format
        );

        if (response.success) {
          return response.data;
        } else {
          throw new Error(
            response.message || "Failed to export tech debt items"
          );
        }
      } catch (err) {
        setError(err.message || "An error occurred while exporting");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Change limit
   */
  const changeLimit = useCallback((limit) => {
    setPagination({ page: 1, limit });
  }, []);

  /**
   * Change sort
   */
  const changeSort = useCallback((sortBy, sortOrder) => {
    setSortBy(sortBy);
    setSortOrder(sortOrder);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Navigate to tech debt detail
   */
  const navigateToDetail = useCallback(
    (techDebtId) => {
      navigate(`/tech-debt/${techDebtId}`);
    },
    [navigate]
  );

  /**
   * Navigate to tech debt edit
   */
  const navigateToEdit = useCallback(
    (techDebtId) => {
      navigate(`/tech-debt/${techDebtId}/edit`);
    },
    [navigate]
  );

  /**
   * Navigate to new tech debt form
   */
  const navigateToNew = useCallback(() => {
    navigate("/tech-debt/new");
  }, [navigate]);

  /**
   * Navigate to dashboard
   */
  const navigateToDashboard = useCallback(() => {
    navigate("/tech-debt/dashboard");
  }, [navigate]);

  // Memoized computed values
  const priorityStats = useMemo(() => {
    const stats = {
      critical: { count: 0, items: [] },
      high: { count: 0, items: [] },
      medium: { count: 0, items: [] },
      low: { count: 0, items: [] },
    };
    items.forEach((item) => {
      if (stats[item.priority]) {
        stats[item.priority].count++;
        stats[item.priority].items.push(item);
      }
    });
    return stats;
  }, [items]);

  const statusStats = useMemo(() => {
    const stats = {
      identified: { count: 0, items: [] },
      planned: { count: 0, items: [] },
      in_progress: { count: 0, items: [] },
      resolved: { count: 0, items: [] },
      ignored: { count: 0, items: [] },
    };
    items.forEach((item) => {
      if (stats[item.status]) {
        stats[item.status].count++;
        stats[item.status].items.push(item);
      }
    });
    return stats;
  }, [items]);

  const totalEffort = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (item.estimated_effort_hours || 0),
      0
    );
  }, [items]);

  const resolutionRate = useMemo(() => {
    if (items.length === 0) return 0;
    const resolved = items.filter((item) => item.status === "resolved").length;
    return Math.round((resolved / items.length) * 100);
  }, [items]);

  const scoreLevel = useMemo(() => {
    return score ? getScoreLevel(score.score) : null;
  }, [score]);

  // Auto-fetch on dependency changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Load initial data
  useEffect(() => {
    if (projectId) {
      fetchOverview();
      fetchScore();
      fetchStatistics();
      fetchSuggestions();
    }
  }, [projectId]);

  return {
    // State
    items,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    overview,
    score,
    statistics,
    suggestions,

    // Computed
    priorityStats,
    statusStats,
    totalEffort,
    resolutionRate,
    scoreLevel,
    hasItems: items.length > 0,

    // Fetch functions
    fetchItems,
    fetchOverview,
    fetchScore,
    fetchStatistics,
    fetchSuggestions,

    // CRUD operations
    createItem,
    updateItem,
    updateStatus,
    deleteItem,
    getItemById,

    // Utility functions
    exportItems,

    // Filter functions
    updateFilters,
    resetFilters,

    // Pagination functions
    changePage,
    changeLimit,

    // Sort functions
    changeSort,

    // Navigation functions
    navigateToDetail,
    navigateToEdit,
    navigateToNew,
    navigateToDashboard,

    // Helper functions
    getPriority,
    getPriorityLabel,
    getPriorityColor,
    getPriorityIcon,
    getStatus,
    getStatusLabel,
    getStatusColor,
    getStatusIcon,

    // Project ID
    projectId,
  };
};

export default useTechDebt;
