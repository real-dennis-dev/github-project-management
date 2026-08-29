// src/components/expenses/ExpenseStatistics.jsx
import React, { useEffect } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { LoadingSpinner, Alert, Badge } from "../common";
import { CATEGORY_LABELS } from "../../utils/expenseValidation";

const ExpenseStatistics = ({ projectId }) => {
  const { getStatistics, statistics, isStatisticsLoading, error, clearError } =
    useExpenses();

  useEffect(() => {
    if (projectId) {
      getStatistics(projectId);
    }
  }, [projectId]);

  if (isStatisticsLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!statistics) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const summary = statistics.summary || {};
  const categories = statistics.categories || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <p className="text-sm text-neutral-500">Total</p>
          <p className="text-2xl font-bold text-neutral-900">
            {summary.formatted_total || formatCurrency(summary.total || 0)}
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <p className="text-sm text-neutral-500">Average</p>
          <p className="text-2xl font-bold text-neutral-900">
            {summary.formatted_average || formatCurrency(summary.average || 0)}
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <p className="text-sm text-neutral-500">Count</p>
          <p className="text-2xl font-bold text-neutral-900">
            {summary.count || 0}
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <p className="text-sm text-neutral-500">Categories</p>
          <p className="text-2xl font-bold text-neutral-900">
            {categories.length}
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Category Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg"
              >
                <span className="text-sm text-neutral-600">
                  {cat.category_label ||
                    CATEGORY_LABELS[cat.category] ||
                    cat.category}
                </span>
                <Badge variant="info" size="sm">
                  {cat.percentage?.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseStatistics;
