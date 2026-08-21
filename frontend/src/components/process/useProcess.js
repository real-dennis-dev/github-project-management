// src/components/process/useProcess.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import processService from "./ProcessService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
  DEFAULT_MONTHLY_PROGRESS,
} from "./ProcessConstants";

/**
 * Custom hook for process/progress management
 */
export const useProcess = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("month_year");
  const [sortOrder, setSortOrder] = useState("asc");
  const [overview, setOverview] = useState(null);
  const [monthlyProgress, setMonthlyProgress] = useState(
    DEFAULT_MONTHLY_PROGRESS
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [features, setFeatures] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  /**
   * Fetch timeline entries with current filters and pagination
   */
  const fetchTimeline = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
        sort_order: sortOrder,
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

      const response = await processService.getTimeline(projectId, params);

      if (response.success) {
        setTimelineEntries(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.pagination,
          }));
        }
      } else {
        throw new Error(response.message || "Failed to fetch timeline");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching timeline");
      setTimelineEntries([]);
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
   * Fetch progress overview
   */
  const fetchOverview = useCallback(
    async (months = 12) => {
      if (!projectId) return;

      try {
        const response = await processService.getProgressOverview(
          projectId,
          months
        );
        if (response.success) {
          setOverview(response.data);
          // Extract features from overview if available
          if (response.data?.chartData?.features) {
            setFeatures(response.data.chartData.features);
          }
        }
      } catch (err) {
        console.error("Failed to fetch overview:", err);
      }
    },
    [projectId]
  );

  /**
   * Fetch monthly progress
   */
  const fetchMonthlyProgress = useCallback(
    async (month, featureName = null) => {
      if (!projectId || !month) return;

      try {
        const response = await processService.getMonthlyProgress(
          projectId,
          month,
          featureName
        );
        if (response.success) {
          setMonthlyProgress(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch monthly progress:", err);
      }
    },
    [projectId]
  );

  /**
   * Create a new timeline entry
   */
  const createTimelineEntry = useCallback(
    async (entryData) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await processService.createTimelineEntry(
          projectId,
          entryData
        );

        if (response.success) {
          await fetchTimeline();
          await fetchOverview();
          await fetchMonthlyProgress(selectedMonth);
          return response.data;
        } else {
          throw new Error(
            response.message || "Failed to create timeline entry"
          );
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      projectId,
      fetchTimeline,
      fetchOverview,
      fetchMonthlyProgress,
      selectedMonth,
    ]
  );

  /**
   * Bulk create timeline entries
   */
  const bulkCreateEntries = useCallback(
    async (entries) => {
      if (!projectId || !entries.length) {
        throw new Error("Project ID and entries are required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await processService.bulkCreateTimelineEntries(
          projectId,
          entries
        );

        if (response.success) {
          await fetchTimeline();
          await fetchOverview();
          await fetchMonthlyProgress(selectedMonth);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create entries");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating entries");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      projectId,
      fetchTimeline,
      fetchOverview,
      fetchMonthlyProgress,
      selectedMonth,
    ]
  );

  /**
   * Update a timeline entry
   */
  const updateTimelineEntry = useCallback(
    async (entryId, entryData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await processService.updateTimelineEntry(
          entryId,
          entryData
        );

        if (response.success) {
          await fetchTimeline();
          await fetchOverview();
          await fetchMonthlyProgress(selectedMonth);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update entry");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTimeline, fetchOverview, fetchMonthlyProgress, selectedMonth]
  );

  /**
   * Delete a timeline entry
   */
  const deleteTimelineEntry = useCallback(
    async (entryId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await processService.deleteTimelineEntry(entryId);

        if (response.success) {
          await fetchTimeline();
          await fetchOverview();
          await fetchMonthlyProgress(selectedMonth);
          return true;
        } else {
          throw new Error(response.message || "Failed to delete entry");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTimeline, fetchOverview, fetchMonthlyProgress, selectedMonth]
  );

  /**
   * Get a single timeline entry by ID
   */
  const getTimelineEntryById = useCallback(
    async (entryId) => {
      if (!entryId) return null;

      setLoading(true);
      setError(null);

      try {
        // Find in existing entries first
        const existing = timelineEntries.find((entry) => entry.id === entryId);
        if (existing) {
          setLoading(false);
          return existing;
        }

        // If not found, fetch it directly (would need a get by ID endpoint)
        // For now, we'll refresh the list
        await fetchTimeline();
        const found = timelineEntries.find((entry) => entry.id === entryId);
        return found || null;
      } catch (err) {
        setError(err.message || "An error occurred while fetching the entry");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [timelineEntries, fetchTimeline]
  );

  /**
   * Generate progress report
   */
  const generateReport = useCallback(
    async (params = {}) => {
      if (!projectId) return;

      setGeneratingReport(true);
      setError(null);

      try {
        const response = await processService.generateProgressReport(
          projectId,
          params
        );

        if (response.success) {
          setReportData(response.data);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to generate report");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while generating the report"
        );
        throw err;
      } finally {
        setGeneratingReport(false);
      }
    },
    [projectId]
  );

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
   * Change selected month
   */
  const changeMonth = useCallback((month) => {
    setSelectedMonth(month);
  }, []);

  /**
   * Navigation functions
   */
  const navigateToDetail = useCallback(
    (entryId) => {
      navigate(`/process/timeline/${entryId}`);
    },
    [navigate]
  );

  const navigateToEdit = useCallback(
    (entryId) => {
      navigate(`/process/timeline/${entryId}/edit`);
    },
    [navigate]
  );

  const navigateToNew = useCallback(() => {
    navigate("/process/timeline/new");
  }, [navigate]);

  const navigateToOverview = useCallback(() => {
    navigate("/process/overview");
  }, [navigate]);

  const navigateToReport = useCallback(() => {
    navigate("/process/report");
  }, [navigate]);

  // Memoized computed values
  const totalProgress = useMemo(() => {
    if (!timelineEntries.length) return 0;
    const sum = timelineEntries.reduce(
      (acc, entry) => acc + (entry.progress_percentage || 0),
      0
    );
    return Math.round(sum / timelineEntries.length);
  }, [timelineEntries]);

  const completedFeatures = useMemo(() => {
    return timelineEntries.filter((entry) => entry.progress_percentage >= 100)
      .length;
  }, [timelineEntries]);

  const averageProgress = useMemo(() => {
    return timelineEntries.length > 0 ? totalProgress : 0;
  }, [timelineEntries, totalProgress]);

  const completionRate = useMemo(() => {
    if (!timelineEntries.length) return 0;
    return Math.round((completedFeatures / timelineEntries.length) * 100);
  }, [timelineEntries, completedFeatures]);

  // Auto-fetch on dependency changes
  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Load initial data
  useEffect(() => {
    if (projectId) {
      fetchOverview();
      fetchMonthlyProgress(selectedMonth);
    }
  }, [projectId]);

  return {
    // State
    timelineEntries,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    overview,
    monthlyProgress,
    selectedMonth,
    features,
    reportData,
    generatingReport,

    // Computed
    totalProgress,
    averageProgress,
    completedFeatures,
    completionRate,
    hasEntries: timelineEntries.length > 0,

    // Fetch functions
    fetchTimeline,
    fetchOverview,
    fetchMonthlyProgress,

    // CRUD operations
    createTimelineEntry,
    bulkCreateEntries,
    updateTimelineEntry,
    deleteTimelineEntry,
    getTimelineEntryById,

    // Report
    generateReport,

    // Filter functions
    updateFilters,
    resetFilters,

    // Pagination functions
    changePage,
    changeLimit,

    // Sort functions
    changeSort,

    // Month selection
    changeMonth,

    // Navigation functions
    navigateToDetail,
    navigateToEdit,
    navigateToNew,
    navigateToOverview,
    navigateToReport,

    // Project ID
    projectId,
  };
};

export default useProcess;
