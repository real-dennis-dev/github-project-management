// src/components/expenses/ExpenseCategories.jsx
import React, { useEffect } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { LoadingSpinner, Alert, Badge } from "../common";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "../../utils/expenseValidation";

const ExpenseCategories = ({ projectId, fromDate, toDate }) => {
  const { getCategories, categories, isCategoriesLoading, error, clearError } =
    useExpenses();

  useEffect(() => {
    if (projectId) {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      getCategories(projectId, params);
    }
  }, [projectId, fromDate, toDate]);

  if (isCategoriesLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No expense categories found
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        Expenses by Category
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.category}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      category.category_color ||
                      CATEGORY_COLORS[category.category] ||
                      "#9E9E9E",
                  }}
                />
                <span className="font-medium text-neutral-900">
                  {category.category_label ||
                    CATEGORY_LABELS[category.category] ||
                    category.category}
                </span>
              </div>
              <Badge variant="info" size="sm">
                {category.percentage?.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">
                {category.count} expense{category.count !== 1 ? "s" : ""}
              </span>
              <span className="font-medium text-neutral-900">
                {category.formatted_total || formatCurrency(category.total)}
              </span>
            </div>

            <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(category.percentage || 0, 100)}%`,
                  backgroundColor:
                    category.category_color ||
                    CATEGORY_COLORS[category.category] ||
                    "#9E9E9E",
                }}
              />
            </div>

            {category.expenses && category.expenses.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-2">
                  Recent expenses:
                </p>
                <ul className="space-y-1">
                  {category.expenses.slice(0, 3).map((exp) => (
                    <li
                      key={exp.id}
                      className="text-sm text-neutral-600 flex justify-between"
                    >
                      <span className="truncate">{exp.description}</span>
                      <span>
                        {exp.formatted_amount || formatCurrency(exp.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseCategories;
