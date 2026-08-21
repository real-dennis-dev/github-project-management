// src/components/decision-risks/DecisionFilters.jsx
import React from "react";
import { Input, Select, Button } from "../common";

const DecisionFilters = ({ filters, onFilterChange, impactOptions }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClear = () => {
    onFilterChange({
      impact: "",
      fromDate: "",
      toDate: "",
    });
  };

  const impactSelectOptions = [
    { value: "", label: "All Impacts" },
    ...(impactOptions || []).map((level) => ({
      value: level,
      label: level.charAt(0).toUpperCase() + level.slice(1),
    })),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Select
        label="Impact"
        name="impact"
        value={filters.impact || ""}
        onChange={handleChange}
        options={impactSelectOptions}
        fullWidth
      />

      <Input
        label="From Date"
        name="fromDate"
        type="date"
        value={filters.fromDate || ""}
        onChange={handleChange}
        fullWidth
      />

      <Input
        label="To Date"
        name="toDate"
        type="date"
        value={filters.toDate || ""}
        onChange={handleChange}
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

export default DecisionFilters;
