// src/components/projects/ProjectFilterBar.jsx
import React from "react";
import { Select, Button } from "../common";
import { Filter, X, RotateCcw } from "lucide-react";

const ProjectFilterBar = ({ filters, onFilterChange }) => {
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "planning", label: "Planning" },
    { value: "in_progress", label: "In Progress" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({ status: "", priority: "", search: "" });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="flex items-center space-x-4 flex-wrap gap-2 bg-neutral-100 p-4 rounded-lg border border-neutral-300">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-neutral-500" />
        <span className="text-sm font-medium text-neutral-700">Filters:</span>
      </div>

      <Select
        value={filters.status || ""}
        onChange={(e) => handleChange("status", e.target.value)}
        options={statusOptions}
        className="w-40"
        size="sm"
      />

      <Select
        value={filters.priority || ""}
        onChange={(e) => handleChange("priority", e.target.value)}
        options={priorityOptions}
        className="w-40"
        size="sm"
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-neutral-500 hover:text-neutral-700 flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
};

export default ProjectFilterBar;
