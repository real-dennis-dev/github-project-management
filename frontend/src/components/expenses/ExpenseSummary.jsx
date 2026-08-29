// src/components/expenses/ExpenseSummary.jsx
import React, { useEffect } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { LoadingSpinner, Alert, Badge } from "../common";
import { DollarSign, TrendingUp, Receipt, Repeat } from "lucide-react";

const ExpenseSummary = ({ projectId, year }) => {
  const { getSummary, summary, isLoading, error, clearError } = useExpenses();

  useEffect(() => {
    if (projectId) {
      const params = year ? { year } : {};
      getSummary(projectId, params);
    }
  }, [projectId, year]);

  if (isLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      label: "Total Expenses",
      value:
        summary.formatted_total || `$${summary.total?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-primary-500",
    },
    {
      label: "Average",
      value:
        summary.formatted_average ||
        `$${summary.average?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "text-info-500",
    },
    {
      label: "Total Expenses",
      value: summary.count || 0,
      icon: Receipt,
      color: "text-success-500",
    },
    {
      label: "Recurring",
      value: summary.recurringTotal
        ? `$${summary.recurringTotal.toFixed(2)}`
        : "$0.00",
      icon: Repeat,
      color: "text-warning-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {summary.summary && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-700">{summary.summary}</p>
        </div>
      )}

      {summary.categories && Object.keys(summary.categories).length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Category Breakdown
          </h4>
          <div className="space-y-2">
            {Object.entries(summary.categories).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 capitalize">
                  {category}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-neutral-500">
                    {data.count} expense{data.count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    ${data.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;
