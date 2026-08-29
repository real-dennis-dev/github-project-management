// src/components/techdebt/TechDebtFilters.jsx
import React, { useState } from "react";
import { Select, Button } from "../common";

const TechDebtFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
  });

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "identified", label: "Identified" },
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "ignored", label: "Ignored" },
  ];

  const handleChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClear = () => {
    const cleared = { priority: "", status: "" };
    setFilters(cleared);
    if (onFilterChange) {
      onFilterChange(cleared);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.priority}
        onChange={(e) => handleChange("priority", e.target.value)}
        options={priorityOptions}
        className="w-40"
      />
      <Select
        value={filters.status}
        onChange={(e) => handleChange("status", e.target.value)}
        options={statusOptions}
        className="w-40"
      />
      {(filters.priority || filters.status) && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default TechDebtFilters;
