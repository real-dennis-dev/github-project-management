// src/components/vision/VisionCategoryFilter.jsx
import React, { useState } from "react";
import { useVision } from "../../hooks/useVision";
import { Badge, SearchBar } from "../common";

const VisionCategoryFilter = ({ onFilterChange }) => {
  const { categories, filters, setFilters } = useVision();
  const [selectedCategory, setSelectedCategory] = useState(
    filters?.category || ""
  );
  const [selectedStatus, setSelectedStatus] = useState(filters?.status || "");
  const [searchTerm, setSearchTerm] = useState("");

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];

  const handleCategoryClick = (category) => {
    const newCategory = selectedCategory === category ? "" : category;
    setSelectedCategory(newCategory);
    const newFilters = { ...filters, category: newCategory || undefined };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleStatusClick = (status) => {
    const newStatus = selectedStatus === status ? "" : status;
    setSelectedStatus(newStatus);
    const newFilters = { ...filters, status: newStatus || undefined };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Search would be implemented in the parent component
    if (onFilterChange) {
      onFilterChange({ ...filters, search: value || undefined });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedStatus("");
    setSearchTerm("");
    setFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-neutral-600">Status:</span>
        {statusOptions.map((option) => (
          <Badge
            key={option.value}
            variant={selectedStatus === option.value ? "primary" : "neutral"}
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleStatusClick(option.value)}
          >
            {option.label}
          </Badge>
        ))}
      </div>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-neutral-600">
            Categories:
          </span>
          <Badge
            variant={!selectedCategory ? "primary" : "neutral"}
            className="cursor-pointer hover:opacity-80"
            onClick={() => handleCategoryClick("")}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "primary" : "neutral"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleCategoryClick(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search goals..."
          className="flex-1 max-w-md"
        />
        {(selectedCategory || selectedStatus || searchTerm) && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default VisionCategoryFilter;
