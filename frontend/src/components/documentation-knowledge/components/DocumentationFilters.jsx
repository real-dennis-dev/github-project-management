// src/components/documentation-knowledge/components/DocumentationFilters.jsx

import React from "react";
import { Filter, X } from "lucide-react";
import { Button, Dropdown, DropdownItem } from "../../common";
import { DOCUMENTATION_TYPES } from "../utils/constants";

const DocumentationFilters = ({ filters, onFilterChange }) => {
  const handleTypeChange = (value) => {
    onFilterChange({ doc_type: value });
  };

  const handleClearFilters = () => {
    onFilterChange({ doc_type: "" });
  };

  const hasActiveFilters = filters.doc_type;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-neutral-500" />
        <span className="text-sm text-neutral-600">Filter by:</span>
      </div>

      <Dropdown
        trigger={
          <Button variant="outline" size="sm">
            {filters.doc_type
              ? DOCUMENTATION_TYPES.find((t) => t.value === filters.doc_type)
                  ?.label
              : "Document Type"}
          </Button>
        }
      >
        <DropdownItem onClick={() => handleTypeChange("")}>
          All Types
        </DropdownItem>
        {DOCUMENTATION_TYPES.map((type) => (
          <DropdownItem
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
          >
            {type.label}
          </DropdownItem>
        ))}
      </Dropdown>

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

export default DocumentationFilters;
