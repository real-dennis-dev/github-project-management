// src/components/documentation-knowledge/pages/KnowledgeBaseList.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  Grid,
  List,
  ChevronDown,
  X,
  FolderOpen,
} from "lucide-react";
import {
  Button,
  Input,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  Badge,
  Pagination,
  Dropdown,
  DropdownItem,
} from "../../common";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import KnowledgeCard from "../components/KnowledgeCard";
import KnowledgeFilters from "../components/KnowledgeFilters";
import { KNOWLEDGE_CATEGORIES } from "../utils/constants";
import { formatDate } from "../utils/helpers";

const KnowledgeBaseList = () => {
  const navigate = useNavigate();
  const {
    entries,
    loading,
    error,
    pagination,
    filters,
    categories,
    loadEntries,
    loadCategories,
    search,
    updateFilters,
    resetFilters,
    goToPage,
    changeLimit,
  } = useKnowledgeBase();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadEntries();
    loadCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      search(searchQuery);
    } else {
      loadEntries();
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      loadEntries();
    }
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
    loadEntries(newFilters);
  };

  const handlePageChange = (page) => {
    goToPage(page);
    loadEntries({ offset: (page - 1) * filters.limit });
  };

  const handleLimitChange = (limit) => {
    changeLimit(limit);
    loadEntries({ limit, offset: 0 });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchQuery("");
    setSelectedCategory("");
    loadEntries({ category: "", search: "" });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    updateFilters({ category });
    loadEntries({ category });
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Knowledge Base"
        description={error}
        onRetry={() => loadEntries()}
      />
    );
  }

  const hasActiveFilters = filters.category || filters.tags || filters.search;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Knowledge Base
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Search and manage your knowledge base articles
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/knowledge-base/create")}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Knowledge Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Total Entries</p>
          <p className="text-2xl font-bold text-neutral-900">
            {pagination.total}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Categories</p>
          <p className="text-2xl font-bold text-neutral-900">
            {categories.length}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Recently Updated</p>
          <p className="text-2xl font-bold text-neutral-900">
            {
              entries.filter((e) => {
                const date = new Date(e.updated_at);
                const now = new Date();
                const diff = (now - date) / (1000 * 60 * 60 * 24);
                return diff <= 7;
              }).length
            }
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Most Used Tags</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {categories.slice(0, 3).map((cat) => (
              <Badge key={cat.category} variant="neutral" size="sm">
                {cat.category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search knowledge base..."
              className="pl-10"
              fullWidth
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearFilters}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Clear
            </Button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-neutral-500" />
            <span className="text-sm text-neutral-600">Filters:</span>
          </div>

          <Dropdown
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                {selectedCategory ? selectedCategory : "All Categories"}
                <ChevronDown size={14} />
              </Button>
            }
          >
            <DropdownItem onClick={() => handleCategorySelect("")}>
              All Categories
            </DropdownItem>
            {categories.map((cat) => (
              <DropdownItem
                key={cat.category}
                onClick={() => handleCategorySelect(cat.category)}
              >
                {cat.category} ({cat.count})
              </DropdownItem>
            ))}
          </Dropdown>

          <Link to="/knowledge-base/categories">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <FolderOpen size={14} />
              Manage Categories
            </Button>
          </Link>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="p-2"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="p-2"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Knowledge Entries Grid/List */}
      {entries.length === 0 ? (
        <EmptyState
          title="No Knowledge Entries Found"
          description={
            searchQuery
              ? `No results found for "${searchQuery}"`
              : "No knowledge entries have been created yet."
          }
          action={
            <Button
              variant="primary"
              onClick={() => navigate("/knowledge-base/create")}
            >
              Create First Entry
            </Button>
          }
        />
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {entries.map((entry) => (
              <KnowledgeCard key={entry.id} {...entry} viewMode={viewMode} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Show:</span>
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {filters.limit}
                      <ChevronDown size={14} />
                    </Button>
                  }
                >
                  {[10, 20, 50, 100].map((limit) => (
                    <DropdownItem
                      key={limit}
                      onClick={() => handleLimitChange(limit)}
                    >
                      {limit}
                    </DropdownItem>
                  ))}
                </Dropdown>
                <span className="text-sm text-neutral-500">
                  of {pagination.total} entries
                </span>
              </div>
              <Pagination
                currentPage={Math.floor(filters.offset / filters.limit) + 1}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                siblingCount={1}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KnowledgeBaseList;
