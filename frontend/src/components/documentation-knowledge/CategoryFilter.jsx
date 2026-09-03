// src/components/documentation-knowledge/CategoryFilter.jsx
import React from "react";
import { Badge } from "../common";
import { Filter, X } from "lucide-react";

const CategoryFilter = ({
  categories = [],
  selectedCategory = "",
  onSelectCategory,
  onClear,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-neutral-400 animate-pulse" />
        <span className="text-sm text-neutral-400">Loading categories...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">
            Categories
          </span>
        </div>
        {selectedCategory && (
          <button
            onClick={onClear}
            className="text-xs text-neutral-500 hover:text-neutral-700 flex items-center"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!selectedCategory ? "primary" : "neutral"}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onSelectCategory("")}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.category}
            variant={selectedCategory === cat.category ? "primary" : "neutral"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSelectCategory(cat.category)}
          >
            {cat.category}
            <span className="ml-1 text-xs opacity-60">({cat.count})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
