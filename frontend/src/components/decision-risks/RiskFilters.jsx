// src/components/decision-risks/RiskFilters.jsx
import React from "react";
import { Select, Button } from "../common";

const RiskFilters = ({
  filters,
  onFilterChange,
  levelOptions,
  statusOptions,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClear = () => {
    onFilterChange({
      level: "",
      status: "",
    });
  };

  const levelSelectOptions = [
    { value: "", label: "All Levels" },
    ...(levelOptions || []).map((level) => ({
      value: level,
      label: level.charAt(0).toUpperCase() + level.slice(1),
    })),
  ];

  const statusSelectOptions = [
    { value: "", label: "All Statuses" },
    ...(statusOptions || []).map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    })),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Select
        label="Risk Level"
        name="level"
        value={filters.level || ""}
        onChange={handleChange}
        options={levelSelectOptions}
        fullWidth
      />

      <Select
        label="Status"
        name="status"
        value={filters.status || ""}
        onChange={handleChange}
        options={statusSelectOptions}
        fullWidth
      />

      <div className="flex items-end">
        <Button variant="ghost" onClick={handleClear} fullWidth>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default RiskFilters;
