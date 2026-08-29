// src/components/expenses/ExpenseMonthly.jsx
import React, { useEffect } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { LoadingSpinner, Alert } from "../common";

const ExpenseMonthly = ({ projectId, year }) => {
  const { getMonthly, monthlyData, isMonthlyLoading, error, clearError } =
    useExpenses();

  useEffect(() => {
    if (projectId) {
      const params = year ? { year } : {};
      getMonthly(projectId, params);
    }
  }, [projectId, year]);

  if (isMonthlyLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No monthly expense data available
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const maxTotal = Math.max(...monthlyData.map((m) => m.total), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        Monthly Expenses
      </h3>
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <div className="space-y-3">
          {monthlyData.map((month) => {
            const percentage =
              maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;
            return (
              <div key={month.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">{month.month_name}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-neutral-500">
                      {month.count} expense{month.count !== 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-neutral-900">
                      {month.formatted_total || formatCurrency(month.total)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary-500 transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseMonthly;
