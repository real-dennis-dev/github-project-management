// src/hooks/useExpenses.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExpenseStore } from "../store/expenseStore";
import expenseService from "../services/expenseService";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseFiltersSchema,
  validateForm,
} from "../utils/expenseValidation";

export const useExpenses = () => {
  const queryClient = useQueryClient();
  const store = useExpenseStore();

  // Query Keys
  const EXPENSE_KEYS = {
    all: ["expenses"],
    list: (projectId, params) => ["expenses", "list", projectId, params],
    detail: (id) => ["expenses", "detail", id],
    summary: (projectId, params) => ["expenses", "summary", projectId, params],
    categories: (projectId, params) => [
      "expenses",
      "categories",
      projectId,
      params,
    ],
    monthly: (projectId, params) => ["expenses", "monthly", projectId, params],
    statistics: (projectId) => ["expenses", "statistics", projectId],
    total: (projectId, params) => ["expenses", "total", projectId, params],
  };

  // ============ Queries ============

  // Get expenses query
  const getExpensesQuery = (projectId, params = {}) => {
    const validatedParams = expenseFiltersSchema.cast(params);
    return useQuery({
      queryKey: EXPENSE_KEYS.list(projectId, validatedParams),
      queryFn: () => expenseService.getExpenses(projectId, validatedParams),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setExpenses(response.data, response.meta);
          if (response.meta?.statistics) {
            store.setStatistics(response.meta.statistics);
          }
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch expenses");
      },
    });
  };

  // Get single expense query
  const getExpenseQuery = (expenseId) => {
    return useQuery({
      queryKey: EXPENSE_KEYS.detail(expenseId),
      queryFn: () => expenseService.getExpense(expenseId),
      enabled: !!expenseId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCurrentExpense(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch expense");
      },
    });
  };

  // Get summary query
  const getSummaryQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: EXPENSE_KEYS.summary(projectId, params),
      queryFn: () => expenseService.getSummary(projectId, params),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setSummary(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch summary");
      },
    });
  };

  // Get categories query
  const getCategoriesQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: EXPENSE_KEYS.categories(projectId, params),
      queryFn: () => expenseService.getCategories(projectId, params),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setCategories(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch categories");
      },
    });
  };

  // Get monthly query
  const getMonthlyQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: EXPENSE_KEYS.monthly(projectId, params),
      queryFn: () => expenseService.getMonthly(projectId, params),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setMonthlyData(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch monthly data");
      },
    });
  };

  // Get statistics query
  const getStatisticsQuery = (projectId) => {
    return useQuery({
      queryKey: EXPENSE_KEYS.statistics(projectId),
      queryFn: () => expenseService.getStatistics(projectId),
      enabled: !!projectId,
      onSuccess: (response) => {
        if (response.success) {
          store.setStatistics(response.data);
        }
      },
      onError: (error) => {
        store.setError(error.message || "Failed to fetch statistics");
      },
    });
  };

  // Get total query
  const getTotalQuery = (projectId, params = {}) => {
    return useQuery({
      queryKey: EXPENSE_KEYS.total(projectId, params),
      queryFn: () => expenseService.getTotal(projectId, params),
      enabled: !!projectId,
      onError: (error) => {
        store.setError(error.message || "Failed to fetch total");
      },
    });
  };

  // ============ Mutations ============

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: ({ projectId, data }) => {
      return validateForm(createExpenseSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return expenseService.createExpense(projectId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.addExpense(response.data);
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to create expense");
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({ expenseId, data }) => {
      return validateForm(updateExpenseSchema, data).then((validation) => {
        if (!validation.isValid) {
          throw new Error(JSON.stringify(validation.errors));
        }
        return expenseService.updateExpense(expenseId, data);
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        store.updateExpense(response.data);
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        });
      }
    },
    onError: (error) => {
      let message = error.message;
      try {
        const errors = JSON.parse(error.message);
        message = Object.values(errors).join(", ");
      } catch {
        // Use error message as is
      }
      store.setError(message || "Failed to update expense");
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId) => {
      return expenseService.deleteExpense(expenseId);
    },
    onSuccess: (response) => {
      if (response.success) {
        store.removeExpense(response.data?.id);
        queryClient.invalidateQueries({
          queryKey: ["expenses"],
        });
      }
    },
    onError: (error) => {
      store.setError(error.message || "Failed to delete expense");
    },
  });

  // ============ API Methods ============

  const getExpenses = (projectId, params = {}) => {
    return getExpensesQuery(projectId, params);
  };

  const getExpense = (expenseId) => {
    return getExpenseQuery(expenseId);
  };

  const getSummary = (projectId, params = {}) => {
    return getSummaryQuery(projectId, params);
  };

  const getCategories = (projectId, params = {}) => {
    return getCategoriesQuery(projectId, params);
  };

  const getMonthly = (projectId, params = {}) => {
    return getMonthlyQuery(projectId, params);
  };

  const getStatistics = (projectId) => {
    return getStatisticsQuery(projectId);
  };

  const getTotal = (projectId, params = {}) => {
    return getTotalQuery(projectId, params);
  };

  const createExpense = async (projectId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await createExpenseMutation.mutateAsync({
        projectId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const updateExpense = async (expenseId, data) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await updateExpenseMutation.mutateAsync({
        expenseId,
        data,
      });
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await deleteExpenseMutation.mutateAsync(expenseId);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  const exportExpenses = async (projectId, params = {}) => {
    store.clearError();
    store.setLoading(true);
    try {
      const result = await expenseService.exportExpenses(projectId, params);
      return result;
    } finally {
      store.setLoading(false);
    }
  };

  // ============ Store Actions ============

  const clearError = () => store.clearError();
  const clearExpenses = () => store.clearExpenses();
  const reset = () => store.reset();
  const setFilters = (filters) => store.setFilters(filters);
  const resetFilters = () => store.resetFilters();

  return {
    // State from store
    expenses: store.expenses,
    currentExpense: store.currentExpense,
    summary: store.summary,
    categories: store.categories,
    monthlyData: store.monthlyData,
    statistics: store.statistics,
    isLoading: store.isLoading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,

    // Query loading states
    isExpensesLoading: getExpensesQuery("", {}).isLoading,
    isExpenseLoading: getExpenseQuery("").isLoading,
    isSummaryLoading: getSummaryQuery("").isLoading,
    isCategoriesLoading: getCategoriesQuery("").isLoading,
    isMonthlyLoading: getMonthlyQuery("").isLoading,
    isStatisticsLoading: getStatisticsQuery("").isLoading,

    // Mutation loading states
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,

    // Query methods
    getExpenses,
    getExpense,
    getSummary,
    getCategories,
    getMonthly,
    getStatistics,
    getTotal,

    // Mutation methods
    createExpense,
    updateExpense,
    deleteExpense,
    exportExpenses,

    // Store actions
    clearError,
    clearExpenses,
    reset,
    setFilters,
    resetFilters,
  };
};

export default useExpenses;
