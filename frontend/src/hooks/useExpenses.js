// src/components/expense/useExpenses.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import expenseService from "../services/ExpenseService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
} from "../components/expense/ExpenseConstants";

/**
 * Custom hook for expense management
 */
export const useExpenses = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("expense_date");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [statistics, setStatistics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(null);

  /**
   * Fetch expenses with current filters and pagination
   */
  const fetchExpenses = useCallback(async () => {
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

      const response = await expenseService.getExpenses(projectId, params);

      if (response.success) {
        setExpenses(response.data || []);
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
        throw new Error(response.message || "Failed to fetch expenses");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching expenses");
      setExpenses([]);
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
   * Fetch expense summary
   */
  const fetchSummary = useCallback(
    async (year) => {
      if (!projectId) return;

      try {
        const response = await expenseService.getExpenseSummary(
          projectId,
          year
        );
        if (response.success) {
          setSummary(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    },
    [projectId]
  );

  /**
   * Fetch category breakdown
   */
  const fetchCategoryData = useCallback(
    async (fromDate, toDate) => {
      if (!projectId) return;

      try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const response = await expenseService.getExpensesByCategory(
          projectId,
          params
        );
        if (response.success) {
          setCategoryData(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch category data:", err);
      }
    },
    [projectId]
  );

  /**
   * Fetch monthly expenses
   */
  const fetchMonthlyData = useCallback(
    async (year) => {
      if (!projectId) return;

      try {
        const response = await expenseService.getMonthlyExpenses(
          projectId,
          year
        );
        if (response.success) {
          setMonthlyData(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch monthly data:", err);
      }
    },
    [projectId]
  );

  /**
   * Fetch total expenses
   */
  const fetchTotalExpenses = useCallback(
    async (fromDate, toDate) => {
      if (!projectId) return;

      try {
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const response = await expenseService.getTotalExpenses(
          projectId,
          params
        );
        if (response.success) {
          setTotalExpenses(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch total expenses:", err);
      }
    },
    [projectId]
  );

  /**
   * Create a new expense
   */
  const createExpense = useCallback(
    async (expenseData) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await expenseService.createExpense(
          projectId,
          expenseData
        );

        if (response.success) {
          await fetchExpenses();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create expense");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the expense");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchExpenses]
  );

  /**
   * Update an expense
   */
  const updateExpense = useCallback(
    async (expenseId, expenseData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await expenseService.updateExpense(
          expenseId,
          expenseData
        );

        if (response.success) {
          await fetchExpenses();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update expense");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the expense");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchExpenses]
  );

  /**
   * Delete an expense
   */
  const deleteExpense = useCallback(
    async (expenseId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await expenseService.deleteExpense(expenseId);

        if (response.success) {
          await fetchExpenses();
          return true;
        } else {
          throw new Error(response.message || "Failed to delete expense");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the expense");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchExpenses]
  );

  /**
   * Get a single expense by ID
   */
  const getExpenseById = useCallback(async (expenseId) => {
    if (!expenseId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await expenseService.getExpenseById(expenseId);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch expense");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching the expense");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export expenses
   */
  const exportExpenses = useCallback(
    async (format = "json", fromDate, toDate) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const params = { format };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const response = await expenseService.exportExpenses(projectId, params);

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message || "Failed to export expenses");
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
   * Navigate to expense detail
   */
  const navigateToDetail = useCallback(
    (expenseId) => {
      navigate(`/expenses/${expenseId}`);
    },
    [navigate]
  );

  /**
   * Navigate to expense edit
   */
  const navigateToEdit = useCallback(
    (expenseId) => {
      navigate(`/expenses/${expenseId}/edit`);
    },
    [navigate]
  );

  /**
   * Navigate to new expense form
   */
  const navigateToNew = useCallback(() => {
    navigate("/expenses/new");
  }, [navigate]);

  /**
   * Navigate to summary
   */
  const navigateToSummary = useCallback(() => {
    navigate("/expenses/summary");
  }, [navigate]);

  /**
   * Navigate to statistics
   */
  const navigateToStatistics = useCallback(() => {
    navigate("/expenses/statistics");
  }, [navigate]);

  // Memoized computed values
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [expenses]);

  const averageAmount = useMemo(() => {
    return expenses.length > 0 ? totalAmount / expenses.length : 0;
  }, [expenses, totalAmount]);

  const recurringCount = useMemo(() => {
    return expenses.filter((exp) => exp.recurring).length;
  }, [expenses]);

  // Auto-fetch on dependency changes
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Load initial data
  useEffect(() => {
    if (projectId) {
      fetchSummary();
      fetchCategoryData();
      fetchMonthlyData();
      fetchTotalExpenses();
    }
  }, [projectId]);

  return {
    // State
    expenses,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    statistics,
    summary,
    categoryData,
    monthlyData,
    totalExpenses,

    // Computed
    totalAmount,
    averageAmount,
    recurringCount,
    hasExpenses: expenses.length > 0,

    // Fetch functions
    fetchExpenses,
    fetchSummary,
    fetchCategoryData,
    fetchMonthlyData,
    fetchTotalExpenses,

    // CRUD operations
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,

    // Utility functions
    exportExpenses,

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
    navigateToSummary,
    navigateToStatistics,

    // Project ID
    projectId,
  };
};

export default useExpenses;
