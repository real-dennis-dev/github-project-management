// src/components/documentation-knowledge/components/KnowledgeFilters.jsx

import React from "react";
import { Filter, X } from "lucide-react";
import { Button, Dropdown, DropdownItem, Input } from "../../common";
import { KNOWLEDGE_CATEGORIES } from "../utils/constants";

const KnowledgeFilters = ({ filters, onFilterChange, categories }) => {
  const handleCategoryChange = (value) => {
    onFilterChange({ category: value });
  };

  const handleTagsChange = (e) => {
    onFilterChange({ tags: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({ category: "", tags: "" });
  };

  const hasActiveFilters = filters.category || filters.tags;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-neutral-500" />
        <span className="text-sm text-neutral-600">Filter by:</span>
      </div>

      <Dropdown
        trigger={
          <Button variant="outline" size="sm">
            {filters.category || "Category"}
          </Button>
        }
      >
        <DropdownItem onClick={() => handleCategoryChange("")}>
          All Categories
        </DropdownItem>
        {(categories || KNOWLEDGE_CATEGORIES).map((cat) => (
          <DropdownItem
            key={typeof cat === "string" ? cat : cat.category}
            onClick={() =>
              handleCategoryChange(typeof cat === "string" ? cat : cat.category)
            }
          >
            {typeof cat === "string" ? cat : `${cat.category} (${cat.count})`}
          </DropdownItem>
        ))}
      </Dropdown>

      <div className="w-40">
        <Input
          placeholder="Filter by tags..."
          value={filters.tags || ""}
          onChange={handleTagsChange}
          size="sm"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="flex items-center gap-1 text-neutral-500"
        >
          <X size={14} />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default KnowledgeFilters;
