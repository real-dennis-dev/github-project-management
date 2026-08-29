// src/components/expenses/ExpenseFilters.jsx
import React, { useState } from "react";
import { Button, Select, Input, Checkbox } from "../common";
import { useExpenses } from "../../hooks/useExpenses";
import { CATEGORY_OPTIONS } from "../../utils/expenseValidation";
import { Filter, X } from "lucide-react";

const ExpenseFilters = ({ projectId }) => {
  const { filters, setFilters, resetFilters } = useExpenses();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    setIsExpanded(false);
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters({
      category: "",
      fromDate: "",
      toDate: "",
      minAmount: "",
      maxAmount: "",
      vendor: "",
      recurring: null,
      sortBy: "expense_date",
      sortOrder: "DESC",
    });
    setIsExpanded(false);
  };

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {Object.values(filters).some((v) => v && v !== "" && v !== null) && (
          <span className="w-2 h-2 bg-primary-500 rounded-full" />
        )}
      </Button>

      {isExpanded && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Category"
              name="category"
              value={localFilters.category || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "All Categories" },
                ...CATEGORY_OPTIONS,
              ]}
            />
            <Input
              label="Vendor"
              name="vendor"
              value={localFilters.vendor || ""}
              onChange={handleChange}
              placeholder="Search vendor"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Recurring
              </label>
              <select
                name="recurring"
                value={
                  localFilters.recurring === null
                    ? ""
                    : String(localFilters.recurring)
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalFilters((prev) => ({
                    ...prev,
                    recurring: value === "" ? null : value === "true",
                  }));
                }}
                className="w-full px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="true">Recurring</option>
                <option value="false">One-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="From Date"
              name="fromDate"
              type="date"
              value={localFilters.fromDate || ""}
              onChange={handleChange}
            />
            <Input
              label="To Date"
              name="toDate"
              type="date"
              value={localFilters.toDate || ""}
              onChange={handleChange}
            />
            <Input
              label="Min Amount"
              name="minAmount"
              type="number"
              step="0.01"
              min="0"
              value={localFilters.minAmount || ""}
              onChange={handleChange}
              placeholder="0.00"
            />
            <Input
              label="Max Amount"
              name="maxAmount"
              type="number"
              step="0.01"
              min="0"
              value={localFilters.maxAmount || ""}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Sort By"
              name="sortBy"
              value={localFilters.sortBy || "expense_date"}
              onChange={handleChange}
              options={[
                { value: "expense_date", label: "Expense Date" },
                { value: "amount", label: "Amount" },
                { value: "category", label: "Category" },
                { value: "created_at", label: "Created At" },
              ]}
            />
            <Select
              label="Sort Order"
              name="sortOrder"
              value={localFilters.sortOrder || "DESC"}
              onChange={handleChange}
              options={[
                { value: "DESC", label: "Descending" },
                { value: "ASC", label: "Ascending" },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;
