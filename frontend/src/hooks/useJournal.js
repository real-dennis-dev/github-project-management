// src/hooks/useJournal.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useJournalStore } from "../store/journalStore";
import { journalService } from "../services/journalService";
import {
  journalEntrySchema,
  journalFilterSchema,
  validateForm,
  MOODS,
  MOOD_SCORES,
} from "../utils/journalValidation";
import { useToast } from "./useToast";

export const useJournal = (projectId) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Store state
  const {
    entries,
    currentEntry,
    stats,
    monthlyData,
    isLoading,
    error,
    pagination,
    filters,
    setEntries,
    setCurrentEntry,
    setStats,
    setMonthlyData,
    setLoading,
    setError,
    setPagination,
    setFilters,
    addEntry,
    updateEntry,
    removeEntry,
    clearJournal,
    resetFilters,
  } = useJournalStore();

  // ===== QUERIES =====

  // Get entries query
  const entriesQuery = useQuery({
    queryKey: ["journal", "entries", projectId, filters, pagination.page],
    queryFn: async () => {
      if (!projectId) return null;
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        };
        // Remove null/undefined filters
        Object.keys(params).forEach((key) => {
          if (params[key] === null || params[key] === undefined) {
            delete params[key];
          }
        });

        const response = await journalService.getEntries(projectId, params);
        setEntries(response.data, response.meta);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch entries");
        throw err;
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
  });

  // Get single entry query
  const entryQuery = useQuery({
    queryKey: ["journal", "entry", currentEntry?.id],
    queryFn: async () => {
      if (!currentEntry?.id) return null;
      setLoading(true);
      try {
        const response = await journalService.getEntry(currentEntry.id);
        setCurrentEntry(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch entry");
        throw err;
      }
    },
    enabled: !!currentEntry?.id,
    staleTime: 1000 * 60 * 2,
  });

  // Get stats query
  const statsQuery = useQuery({
    queryKey: ["journal", "stats", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      setLoading(true);
      try {
        const response = await journalService.getStats(projectId);
        setStats(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch stats");
        throw err;
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

  // Get monthly data query
  const monthQuery = useQuery({
    queryKey: [
      "journal",
      "month",
      projectId,
      monthlyData?.month,
      monthlyData?.year,
    ],
    queryFn: async () => {
      if (!projectId || !monthlyData?.year || !monthlyData?.month) return null;
      setLoading(true);
      try {
        const response = await journalService.getMonthEntries(
          projectId,
          monthlyData.year,
          monthlyData.month
        );
        setMonthlyData(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch month data");
        throw err;
      }
    },
    enabled: !!projectId && !!monthlyData?.year && !!monthlyData?.month,
    staleTime: 1000 * 60 * 5,
  });

  // ===== MUTATIONS =====

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data) => {
      const validation = await validateForm(journalEntrySchema, data);
      if (!validation.isValid) {
        throw new Error("Validation failed", { cause: validation.errors });
      }
      return journalService.createEntry(projectId, data);
    },
    onSuccess: (response) => {
      addEntry(response.data);
      toast.success(response.message || "Journal entry created successfully");
      queryClient.invalidateQueries(["journal", "entries", projectId]);
      queryClient.invalidateQueries(["journal", "stats", projectId]);
      queryClient.invalidateQueries(["journal", "month", projectId]);
    },
    onError: (err) => {
      const message = err.response?.data?.message || "Failed to create entry";
      toast.error(message);
      setError(message);
    },
  });

  // Update entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const validation = await validateForm(journalEntrySchema, data);
      if (!validation.isValid) {
        throw new Error("Validation failed", { cause: validation.errors });
      }
      return journalService.updateEntry(id, data);
    },
    onSuccess: (response) => {
      updateEntry(response.data);
      toast.success(response.message || "Journal entry updated successfully");
      queryClient.invalidateQueries(["journal", "entries", projectId]);
      queryClient.invalidateQueries(["journal", "stats", projectId]);
      queryClient.invalidateQueries(["journal", "month", projectId]);
    },
    onError: (err) => {
      const message = err.response?.data?.message || "Failed to update entry";
      toast.error(message);
      setError(message);
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id) => {
      return journalService.deleteEntry(id);
    },
    onSuccess: (response, id) => {
      removeEntry(id);
      toast.success(response.message || "Journal entry deleted successfully");
      queryClient.invalidateQueries(["journal", "entries", projectId]);
      queryClient.invalidateQueries(["journal", "stats", projectId]);
      queryClient.invalidateQueries(["journal", "month", projectId]);
    },
    onError: (err) => {
      const message = err.response?.data?.message || "Failed to delete entry";
      toast.error(message);
      setError(message);
    },
  });

  // Get today's entry mutation
  const getTodayEntryMutation = useMutation({
    mutationFn: async () => {
      return journalService.getTodayEntry(projectId);
    },
    onSuccess: (response) => {
      setCurrentEntry(response.data);
      return response.data;
    },
    onError: (err) => {
      const message =
        err.response?.data?.message || "Failed to get today's entry";
      toast.error(message);
      setError(message);
    },
  });

  // Get entry by date mutation
  const getEntryByDateMutation = useMutation({
    mutationFn: async (date) => {
      return journalService.getEntryByDate(projectId, date);
    },
    onSuccess: (response) => {
      setCurrentEntry(response.data);
      return response.data;
    },
    onError: (err) => {
      const message =
        err.response?.data?.message || "No entry found for this date";
      // Don't show toast for 404 - it's expected
      if (err.response?.status !== 404) {
        toast.error(message);
      }
      setError(message);
      return null;
    },
  });

  // Export entries mutation
  const exportEntriesMutation = useMutation({
    mutationFn: async (params) => {
      return journalService.exportEntries(projectId, params);
    },
    onSuccess: (data, params) => {
      const format = params.format || "json";
      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `journal-export-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Journal exported successfully as ${format.toUpperCase()}`);
    },
    onError: (err) => {
      const message = err.response?.data?.message || "Failed to export entries";
      toast.error(message);
      setError(message);
    },
  });

  // ===== HELPER METHODS =====

  const refetchEntries = () => {
    entriesQuery.refetch();
  };

  const refetchStats = () => {
    statsQuery.refetch();
  };

  const refetchMonth = () => {
    monthQuery.refetch();
  };

  const fetchMonthData = (year, month) => {
    setMonthlyData({ year, month });
  };

  const changePage = (page) => {
    setPagination({ page });
  };

  const changeFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination({ page: 1 });
  };

  const clearError = () => {
    setError(null);
  };

  // Mood helper functions
  const getMoodLabel = (mood) => {
    const labels = {
      "😊": "Happy",
      "😐": "Neutral",
      "😔": "Sad",
      "😡": "Angry",
      "😴": "Tired",
      "🤔": "Thoughtful",
      "🎉": "Celebratory",
      "😰": "Anxious",
    };
    return labels[mood] || mood;
  };

  const getMoodScore = (mood) => {
    return MOOD_SCORES[mood] || 3;
  };

  const getMoodColor = (mood) => {
    const colors = {
      "😊": "text-green-500",
      "😐": "text-yellow-500",
      "😔": "text-blue-400",
      "😡": "text-red-500",
      "😴": "text-gray-400",
      "🤔": "text-purple-400",
      "🎉": "text-yellow-400",
      "😰": "text-orange-400",
    };
    return colors[mood] || "text-gray-400";
  };

  const getMoodBgColor = (mood) => {
    const colors = {
      "😊": "bg-green-500/10",
      "😐": "bg-yellow-500/10",
      "😔": "bg-blue-500/10",
      "😡": "bg-red-500/10",
      "😴": "bg-gray-500/10",
      "🤔": "bg-purple-500/10",
      "🎉": "bg-yellow-500/10",
      "😰": "bg-orange-500/10",
    };
    return colors[mood] || "bg-gray-500/10";
  };

  return {
    // State
    entries,
    currentEntry,
    stats,
    monthlyData,
    isLoading: isLoading || entriesQuery.isLoading || statsQuery.isLoading,
    error,
    pagination,
    filters,
    isEntriesLoading: entriesQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isMonthLoading: monthQuery.isLoading,
    isCreating: createEntryMutation.isPending,
    isUpdating: updateEntryMutation.isPending,
    isDeleting: deleteEntryMutation.isPending,
    isExporting: exportEntriesMutation.isPending,

    // Query methods
    refetchEntries,
    refetchStats,
    refetchMonth,
    fetchMonthData,
    changePage,
    changeFilters,
    resetFilters,
    clearError,

    // Mutation methods
    createEntry: createEntryMutation.mutate,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    getTodayEntry: getTodayEntryMutation.mutate,
    getEntryByDate: getEntryByDateMutation.mutate,
    exportEntries: exportEntriesMutation.mutate,

    // Setters
    setCurrentEntry,
    clearJournal,

    // Helpers
    getMoodLabel,
    getMoodScore,
    getMoodColor,
    getMoodBgColor,
    MOODS,
    MOOD_SCORES,
  };
};

export default useJournal;
