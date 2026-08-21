// src/components/vision-board/useVisionBoard.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import visionBoardService from "./VisionBoardService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  getStatus,
  getPriorityLabel,
} from "./VisionBoardConstants";

/**
 * Custom hook for vision board management
 */
export const useVisionBoard = () => {
  const navigate = useNavigate();

  // State
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [goalProgress, setGoalProgress] = useState(null);

  /**
   * Fetch vision goals with current filters and pagination
   */
  const fetchVisionGoals = useCallback(async () => {
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

      const response = await visionBoardService.getVisionGoals(params);

      if (response.success) {
        setGoals(response.data || []);
        if (response.meta) {
          setPagination((prev) => ({
            ...prev,
            ...response.meta.pagination,
          }));
          if (response.meta.statistics) {
            setStatistics(response.meta.statistics);
          }
        }
      } else {
        throw new Error(response.message || "Failed to fetch vision goals");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching vision goals");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await visionBoardService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  }, []);

  /**
   * Fetch categories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await visionBoardService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  /**
   * Fetch options
   */
  const fetchOptions = useCallback(async () => {
    try {
      const response = await visionBoardService.getOptions();
      if (response.success) {
        setOptions(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch options:", err);
    }
  }, []);

  /**
   * Create a new vision goal
   */
  const createVisionGoal = useCallback(
    async (goalData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await visionBoardService.createVisionGoal(goalData);

        if (response.success) {
          await fetchVisionGoals();
          await fetchStatistics();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create vision goal");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while creating the vision goal"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVisionGoals, fetchStatistics]
  );

  /**
   * Update a vision goal
   */
  const updateVisionGoal = useCallback(
    async (goalId, goalData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await visionBoardService.updateVisionGoal(
          goalId,
          goalData
        );

        if (response.success) {
          await fetchVisionGoals();
          await fetchStatistics();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update vision goal");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while updating the vision goal"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVisionGoals, fetchStatistics]
  );

  /**
   * Delete a vision goal
   */
  const deleteVisionGoal = useCallback(
    async (goalId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await visionBoardService.deleteVisionGoal(goalId);

        if (response.success) {
          await fetchVisionGoals();
          await fetchStatistics();
          return true;
        } else {
          throw new Error(response.message || "Failed to delete vision goal");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while deleting the vision goal"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVisionGoals, fetchStatistics]
  );

  /**
   * Get a single vision goal by ID
   */
  const getVisionGoalById = useCallback(async (goalId) => {
    if (!goalId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await visionBoardService.getVisionGoalById(goalId);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch vision goal");
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching the vision goal"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Link a project to a vision goal
   */
  const linkProjectToGoal = useCallback(
    async (goalId, projectId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await visionBoardService.linkProjectToGoal(
          goalId,
          projectId
        );

        if (response.success) {
          await fetchVisionGoals();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to link project");
        }
      } catch (err) {
        setError(err.message || "An error occurred while linking the project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVisionGoals]
  );

  /**
   * Unlink a project from a vision goal
   */
  const unlinkProjectFromGoal = useCallback(
    async (goalId, projectId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await visionBoardService.unlinkProjectFromGoal(
          goalId,
          projectId
        );

        if (response.success) {
          await fetchVisionGoals();
          return true;
        } else {
          throw new Error(response.message || "Failed to unlink project");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while unlinking the project"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVisionGoals]
  );

  /**
   * Get goal progress
   */
  const fetchGoalProgress = useCallback(async (goalId) => {
    try {
      const response = await visionBoardService.getGoalProgress(goalId);
      if (response.success) {
        setGoalProgress(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to fetch goal progress:", err);
      return null;
    }
  }, []);

  /**
   * Get available projects for linking
   */
  const fetchAvailableProjects = useCallback(async (goalId) => {
    try {
      const response = await visionBoardService.getAvailableProjects(goalId);
      if (response.success) {
        setAvailableProjects(response.data || []);
        return response.data;
      }
    } catch (err) {
      console.error("Failed to fetch available projects:", err);
      return [];
    }
  }, []);

  /**
   * Export vision goals
   */
  const exportVisionGoals = useCallback(async (format = "json") => {
    setLoading(true);
    setError(null);

    try {
      const response = await visionBoardService.exportVisionGoals(format);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to export vision goals");
      }
    } catch (err) {
      setError(err.message || "An error occurred while exporting");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
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
   * Navigation functions
   */
  const navigateToDetail = useCallback(
    (goalId) => {
      navigate(`/vision-board/${goalId}`);
    },
    [navigate]
  );

  const navigateToEdit = useCallback(
    (goalId) => {
      navigate(`/vision-board/${goalId}/edit`);
    },
    [navigate]
  );

  const navigateToNew = useCallback(() => {
    navigate("/vision-board/new");
  }, [navigate]);

  const navigateToKanban = useCallback(() => {
    navigate("/vision-board/kanban");
  }, [navigate]);

  const navigateToStatistics = useCallback(() => {
    navigate("/vision-board/statistics");
  }, [navigate]);

  // Memoized computed values
  const totalGoals = useMemo(() => goals.length, [goals]);
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active").length,
    [goals]
  );
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed").length,
    [goals]
  );
  const draftGoals = useMemo(
    () => goals.filter((g) => g.status === "draft").length,
    [goals]
  );
  const archivedGoals = useMemo(
    () => goals.filter((g) => g.status === "archived").length,
    [goals]
  );

  const averagePriority = useMemo(() => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + (g.priority || 0), 0);
    return sum / goals.length;
  }, [goals]);

  const averageProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const sum = goals.reduce((acc, g) => acc + (g.progress || 0), 0);
    return sum / goals.length;
  }, [goals]);

  // Auto-fetch on dependency changes
  useEffect(() => {
    fetchVisionGoals();
  }, [fetchVisionGoals]);

  // Load initial data
  useEffect(() => {
    fetchStatistics();
    fetchCategories();
    fetchOptions();
  }, []);

  return {
    // State
    goals,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    statistics,
    categories,
    options,
    availableProjects,
    goalProgress,

    // Computed
    totalGoals,
    activeGoals,
    completedGoals,
    draftGoals,
    archivedGoals,
    averagePriority,
    averageProgress,
    hasGoals: goals.length > 0,

    // Fetch functions
    fetchVisionGoals,
    fetchStatistics,
    fetchCategories,
    fetchOptions,
    fetchGoalProgress,
    fetchAvailableProjects,

    // CRUD operations
    createVisionGoal,
    updateVisionGoal,
    deleteVisionGoal,
    getVisionGoalById,

    // Link operations
    linkProjectToGoal,
    unlinkProjectFromGoal,

    // Utility functions
    exportVisionGoals,

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
    navigateToKanban,
    navigateToStatistics,
  };
};

export default useVisionBoard;
