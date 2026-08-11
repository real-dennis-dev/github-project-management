// src/components/expense/ExpenseStatistics.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  Button,
  LoadingSpinner,
  Alert,
  IconWrapper,
  EmptyState,
} from "../common";
import useExpenses from "./useExpenses";
import { CATEGORIES, getCategory } from "./ExpenseConstants";

const ExpenseStatistics = () => {
  const { user } = useAuth();
  const { projectId } = useParams();
  const {
    statistics,
    categoryData,
    monthlyData,
    loading,
    error,
    fetchExpenseStatistics,
    navigateToNew,
    navigateToSummary,
  } = useExpenses();

  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadStatistics();
    }
  }, [projectId]);

  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      await fetchExpenseStatistics();
    } catch (err) {
      // Error handled by hook
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading statistics">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expense Statistics</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Detailed analytics for your project expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigateToSummary}>
            <IconWrapper icon="📊" size="sm" />
            Summary
          </Button>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-primary-500">
              {statistics.formatted_total}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Average
            </p>
            <p className="text-2xl font-bold">{statistics.formatted_average}</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Highest Expense
            </p>
            <p className="text-2xl font-bold text-error">
              ${(statistics.max || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Lowest Expense
            </p>
            <p className="text-2xl font-bold text-success">
              ${(statistics.min || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        {categoryData && categoryData.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Category Distribution
            </h2>
            <div className="space-y-4">
              {categoryData.map((category) => {
                const cat = getCategory(category.category);
                return (
                  <div
                    key={category.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat?.color }}
                      />
                      <span className="text-sm">{cat?.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {category.formatted_total}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {monthlyData && monthlyData.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Monthly Trend</h2>
            <div className="space-y-4">
              {monthlyData.slice(-6).map((month) => (
                <div key={month.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.month_name}</span>
                    <span className="text-primary-500 font-medium">
                      {month.formatted_total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (month.total / (statistics?.total || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseStatistics;
