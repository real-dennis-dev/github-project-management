// src/components/progress-timeline/TimelineFilters.jsx
import React, { useState } from "react";
import { Button, Input, Select } from "../common";
import { Filter, X } from "lucide-react";

const TimelineFilters = ({ filters, onFilterChange, isLoading }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [isExpanded, setIsExpanded] = useState(false);

  const sortOptions = [
    { value: "month_year", label: "Month" },
    { value: "feature_name", label: "Feature Name" },
    { value: "progress_percentage", label: "Progress" },
    { value: "created_at", label: "Created Date" },
  ];

  const orderOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  const handleChange = (name, value) => {
    setLocalFilters((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsExpanded(false);
  };

  const clearFilters = () => {
    setLocalFilters({
      from_date: undefined,
      to_date: undefined,
      feature_name: undefined,
      sort_by: "month_year",
      sort_order: "asc",
    });
    onFilterChange({
      from_date: undefined,
      to_date: undefined,
      feature_name: undefined,
      sort_by: "month_year",
      sort_order: "asc",
    });
    setIsExpanded(false);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => localFilters[key] && !["sort_by", "sort_order"].includes(key)
  );

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        disabled={isLoading}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-primary-500" />
        )}
      </button>

      {isExpanded && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={localFilters.from_date || ""}
                onChange={(e) => handleChange("from_date", e.target.value)}
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={localFilters.to_date || ""}
                onChange={(e) => handleChange("to_date", e.target.value)}
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Feature Name
              </label>
              <Input
                type="text"
                value={localFilters.feature_name || ""}
                onChange={(e) => handleChange("feature_name", e.target.value)}
                placeholder="Filter by feature"
                fullWidth
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sort By
              </label>
              <Select
                value={localFilters.sort_by || "month_year"}
                onChange={(e) => handleChange("sort_by", e.target.value)}
                options={sortOptions}
                fullWidth
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sort Order
              </label>
              <Select
                value={localFilters.sort_order || "asc"}
                onChange={(e) => handleChange("sort_order", e.target.value)}
                options={orderOptions}
                fullWidth
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={applyFilters}
              disabled={isLoading}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineFilters;
