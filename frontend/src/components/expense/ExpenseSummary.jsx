// src/components/expense/ExpenseSummary.jsx

import React, { useState } from "react";
import {
  Card,
  Button,
  LoadingSpinner,
  Alert,
  IconWrapper,
  ProgressBar,
} from "../common";
import useExpenses from "./useExpenses";
import { CATEGORIES, getCategory } from "./ExpenseConstants";

const ExpenseSummary = () => {
  const {
    summary,
    categoryData,
    monthlyData,
    totalExpenses,
    loading,
    error,
    fetchSummary,
    fetchCategoryData,
    fetchMonthlyData,
    fetchTotalExpenses,
    navigateToNew,
  } = useExpenses();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Refresh data
  const refreshData = () => {
    fetchSummary(selectedYear);
    fetchCategoryData();
    fetchMonthlyData(selectedYear);
    fetchTotalExpenses();
  };

  // Get current year and previous years for filter
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading summary">
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
          <h1 className="text-2xl font-bold">Expense Summary</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Overview of your project expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(parseInt(e.target.value));
              fetchSummary(parseInt(e.target.value));
              fetchMonthlyData(parseInt(e.target.value));
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <IconWrapper icon="🔄" size="sm" />
            Refresh
          </Button>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-primary-500">
              {summary.formatted_total || "$0.00"}
            </p>
            <p className="text-xs text-neutral-400">
              {summary.count || 0} transactions
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Average per Expense
            </p>
            <p className="text-2xl font-bold">
              {summary.formatted_average || "$0.00"}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Recurring Total
            </p>
            <p className="text-2xl font-bold text-info">
              ${(summary.recurringTotal || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Yearly Total
            </p>
            <p className="text-2xl font-bold text-success">
              ${(summary.yearlyTotal || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryData && categoryData.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {categoryData.map((category) => {
              const cat = getCategory(category.category);
              return (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{cat?.icon}</span>
                      <span>{cat?.label}</span>
                      <span className="text-xs text-neutral-400">
                        ({category.count} items)
                      </span>
                    </span>
                    <span className="font-medium">
                      {category.formatted_total}
                      <span className="text-xs text-neutral-400 ml-1">
                        ({category.percentage}%)
                      </span>
                    </span>
                  </div>
                  <ProgressBar
                    value={category.percentage}
                    max={100}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {monthlyData && monthlyData.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-2 font-medium text-neutral-500">
                    Month
                  </th>
                  <th className="text-right py-2 font-medium text-neutral-500">
                    Total
                  </th>
                  <th className="text-right py-2 font-medium text-neutral-500">
                    Average
                  </th>
                  <th className="text-right py-2 font-medium text-neutral-500">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr
                    key={month.month}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <td className="py-2 font-medium">{month.month_name}</td>
                    <td className="py-2 text-right font-medium text-primary-500">
                      {month.formatted_total}
                    </td>
                    <td className="py-2 text-right">
                      {month.formatted_average}
                    </td>
                    <td className="py-2 text-right text-neutral-500">
                      {month.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {totalExpenses && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-primary-500">
              {totalExpenses.formatted_total}
            </p>
            <p className="text-sm text-neutral-500">Total Spending</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold">{totalExpenses.count || 0}</p>
            <p className="text-sm text-neutral-500">Total Transactions</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-info">
              ${(totalExpenses.average || 0).toFixed(2)}
            </p>
            <p className="text-sm text-neutral-500">Average Transaction</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;
