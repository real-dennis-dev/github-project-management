import { useState, useEffect, useCallback, useMemo } from "react";
import journalService from "../services/journalService";
import { useAuth } from "../../../context/AuthContext";

const MOOD_EMOJIS = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];

const MOOD_SCORES = {
  "😊": 5,
  "🎉": 5,
  "🤔": 3,
  "😐": 3,
  "😴": 2,
  "😔": 2,
  "😰": 1,
  "😡": 1,
};

/**
 * Custom hook for managing journal entries
 */
export const useJournal = (projectId) => {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
    mood: null,
    sortBy: "entry_date",
    sortOrder: "DESC",
  });

  // Reset state when project changes
  useEffect(() => {
    if (projectId) {
      setEntries([]);
      setCurrentEntry(null);
      setTodayEntry(null);
      setStats(null);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
      setError(null);
    }
  }, [projectId]);

  /**
   * Fetch all entries with current filters
   */
  const fetchEntries = useCallback(async () => {
    if (!projectId || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const { page, limit } = pagination;
      const response = await journalService.getEntries(projectId, {
        page,
        limit,
        ...filters,
      });

      if (response.success) {
        setEntries(response.data || []);
        if (response.meta?.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.meta.pagination.total || 0,
            totalPages: response.meta.pagination.totalPages || 0,
          }));
        }
      } else {
        throw new Error(response.message || "Failed to fetch entries");
      }
    } catch (err) {
      setError(err.message || "Failed to load journal entries");
      console.error("Error fetching journal entries:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, isAuthenticated, pagination.page, pagination.limit, filters]);

  /**
   * Fetch today's entry
   */
  const fetchTodayEntry = useCallback(async () => {
    if (!projectId || !isAuthenticated) return;

    try {
      const response = await journalService.getTodayEntry(projectId);
      if (response.success) {
        setTodayEntry(response.data || null);
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching today's entry:", err);
      return null;
    }
  }, [projectId, isAuthenticated]);

  /**
   * Fetch journal statistics
   */
  const fetchStats = useCallback(async () => {
    if (!projectId || !isAuthenticated) return;

    try {
      const response = await journalService.getStats(projectId);
      if (response.success) {
        setStats(response.data || null);
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching journal stats:", err);
      return null;
    }
  }, [projectId, isAuthenticated]);

  /**
   * Fetch entries for a specific month
   */
  const fetchMonthEntries = useCallback(
    async (year, month) => {
      if (!projectId || !isAuthenticated) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await journalService.getMonthEntries(
          projectId,
          year,
          month
        );
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || "Failed to fetch month entries");
      } catch (err) {
        setError(err.message || "Failed to load month entries");
        console.error("Error fetching month entries:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId, isAuthenticated]
  );

  /**
   * Get entry by ID
   */
  const getEntry = useCallback(
    async (id) => {
      if (!id || !isAuthenticated) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await journalService.getEntryById(id);
        if (response.success) {
          setCurrentEntry(response.data || null);
          return response.data;
        }
        throw new Error(response.message || "Failed to fetch entry");
      } catch (err) {
        setError(err.message || "Failed to load journal entry");
        console.error("Error fetching entry:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Get entry by date
   */
  const getEntryByDate = useCallback(
    async (date) => {
      if (!projectId || !isAuthenticated || !date) return null;

      setLoading(true);
      setError(null);

      try {
        const response = await journalService.getEntryByDate(projectId, date);
        if (response.success) {
          return response.data;
        }
        return null;
      } catch (err) {
        if (err.response?.status === 404) {
          return null; // No entry for this date
        }
        console.error("Error fetching entry by date:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId, isAuthenticated]
  );

  /**
   * Create a new journal entry
   */
  const createEntry = useCallback(
    async (data) => {
      if (!projectId || !isAuthenticated) {
        throw new Error("Project ID required and user must be authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await journalService.createEntry(projectId, data);
        if (response.success) {
          const newEntry = response.data;
          setEntries((prev) => [newEntry, ...prev]);

          // Update today entry if it matches today
          const today = new Date().toISOString().split("T")[0];
          if (newEntry.entry_date === today) {
            setTodayEntry(newEntry);
          }

          // Update stats
          await fetchStats();

          return newEntry;
        }
        throw new Error(response.message || "Failed to create entry");
      } catch (err) {
        const errorMsg = err.message || "Failed to create journal entry";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [projectId, isAuthenticated, fetchStats]
  );

  /**
   * Update a journal entry
   */
  const updateEntry = useCallback(
    async (id, data) => {
      if (!id || !isAuthenticated) {
        throw new Error("Entry ID required and user must be authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await journalService.updateEntry(id, data);
        if (response.success) {
          const updatedEntry = response.data;

          // Update entries list
          setEntries((prev) =>
            prev.map((entry) =>
              entry.id === updatedEntry.id ? updatedEntry : entry
            )
          );

          // Update current entry
          setCurrentEntry((prev) =>
            prev?.id === updatedEntry.id ? updatedEntry : prev
          );

          // Update today entry
          const today = new Date().toISOString().split("T")[0];
          if (updatedEntry.entry_date === today) {
            setTodayEntry(updatedEntry);
          }

          // Update stats
          await fetchStats();

          return updatedEntry;
        }
        throw new Error(response.message || "Failed to update entry");
      } catch (err) {
        const errorMsg = err.message || "Failed to update journal entry";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchStats]
  );

  /**
   * Delete a journal entry
   */
  const deleteEntry = useCallback(
    async (id) => {
      if (!id || !isAuthenticated) {
        throw new Error("Entry ID required and user must be authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await journalService.deleteEntry(id);
        if (response.success) {
          // Remove from entries list
          setEntries((prev) => prev.filter((entry) => entry.id !== id));

          // Clear current entry if it was deleted
          setCurrentEntry((prev) => (prev?.id === id ? null : prev));

          // Clear today entry if it was deleted
          setTodayEntry((prev) => (prev?.id === id ? null : prev));

          // Update stats
          await fetchStats();

          return true;
        }
        throw new Error(response.message || "Failed to delete entry");
      } catch (err) {
        const errorMsg = err.message || "Failed to delete journal entry";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchStats]
  );

  /**
   * Export journal entries
   */
  const exportEntries = useCallback(
    async (format = "json", dateRange = {}) => {
      if (!projectId || !isAuthenticated) {
        throw new Error("Project ID required and user must be authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const params = {
          format,
          ...dateRange,
        };
        const response = await journalService.exportEntries(projectId, params);

        if (format === "csv") {
          // Create download for CSV
          const blob = new Blob([response], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `journal-export-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
          return true;
        }

        return response.data || null;
      } catch (err) {
        const errorMsg = err.message || "Failed to export journal entries";
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [projectId, isAuthenticated]
  );

  /**
   * Update filters and refresh entries
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Change items per page
   */
  const changeLimit = useCallback((limit) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchEntries(), fetchTodayEntry(), fetchStats()]);
  }, [fetchEntries, fetchTodayEntry, fetchStats]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (projectId && isAuthenticated) {
      fetchEntries();
      fetchTodayEntry();
      fetchStats();
    }
  }, [projectId, isAuthenticated, fetchEntries, fetchTodayEntry, fetchStats]);

  // Computed values
  const hasEntries = useMemo(() => entries.length > 0, [entries]);
  const hasStats = useMemo(() => stats !== null, [stats]);
  const hasTodayEntry = useMemo(() => todayEntry !== null, [todayEntry]);

  const moodOptions = useMemo(() => MOOD_EMOJIS, []);
  const getMoodScore = useCallback((mood) => MOOD_SCORES[mood] || 3, []);

  return {
    // State
    entries,
    currentEntry,
    todayEntry,
    stats,
    loading,
    error,
    pagination,
    filters,

    // Computed
    hasEntries,
    hasStats,
    hasTodayEntry,
    moodOptions,

    // Actions
    fetchEntries,
    fetchTodayEntry,
    fetchStats,
    fetchMonthEntries,
    getEntry,
    getEntryByDate,
    createEntry,
    updateEntry,
    deleteEntry,
    exportEntries,
    updateFilters,
    changePage,
    changeLimit,
    clearError,
    refreshAll,

    // Utilities
    getMoodScore,
  };
};

export default useJournal;
