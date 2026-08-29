// src/store/expenseStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  expenses: [],
  currentExpense: null,
  summary: null,
  categories: [],
  monthlyData: [],
  statistics: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    category: "",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    vendor: "",
    recurring: null,
    sortBy: "expense_date",
    sortOrder: "DESC",
  },
};

export const useExpenseStore = create(
  persist(
    (set) => ({
      ...initialState,

      setExpenses: (expenses, meta) =>
        set((state) => ({
          expenses,
          pagination: {
            ...state.pagination,
            total: meta?.pagination?.total || state.pagination.total,
            totalPages:
              meta?.pagination?.totalPages || state.pagination.totalPages,
            page: meta?.pagination?.page || state.pagination.page,
            limit: meta?.pagination?.limit || state.pagination.limit,
          },
        })),

      setCurrentExpense: (expense) => set({ currentExpense: expense }),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [expense, ...state.expenses],
        })),

      updateExpense: (expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === expense.id ? expense : e
          ),
          currentExpense:
            state.currentExpense?.id === expense.id
              ? expense
              : state.currentExpense,
        })),

      removeExpense: (expenseId) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== expenseId),
          currentExpense:
            state.currentExpense?.id === expenseId
              ? null
              : state.currentExpense,
        })),

      setSummary: (summary) => set({ summary }),

      setCategories: (categories) => set({ categories }),

      setMonthlyData: (monthlyData) => set({ monthlyData }),

      setStatistics: (statistics) => set({ statistics }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () =>
        set((state) => ({
          filters: { ...initialState.filters },
        })),

      clearError: () => set({ error: null }),

      clearExpenses: () =>
        set({
          expenses: [],
          currentExpense: null,
          summary: null,
          categories: [],
          monthlyData: [],
          statistics: null,
          error: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: "expense-storage",
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
