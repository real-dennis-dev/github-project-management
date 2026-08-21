// src/components/documentation-knowledge/pages/DocumentationList.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  Filter,
  Grid,
  List,
  ChevronDown,
  X,
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
import { useDocumentation } from "../hooks/useDocumentation";
import DocumentationCard from "../components/DocumentationCard";
import DocumentationFilters from "../components/DocumentationFilters";
import { DOCUMENTATION_TYPES } from "../utils/constants";
import { formatDate, getDocTypeLabel } from "../utils/helpers";

const DocumentationList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    documentations,
    loading,
    error,
    pagination,
    filters,
    loadDocumentations,
    search,
    updateFilters,
    resetFilters,
    goToPage,
    changeLimit,
  } = useDocumentation(projectId);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    loadDocumentations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      search(searchQuery);
    } else {
      loadDocumentations();
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value.trim()) {
      loadDocumentations();
    }
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
    loadDocumentations(newFilters);
  };

  const handlePageChange = (page) => {
    goToPage(page);
    loadDocumentations({ offset: (page - 1) * filters.limit });
  };

  const handleLimitChange = (limit) => {
    changeLimit(limit);
    loadDocumentations({ limit, offset: 0 });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchQuery("");
    setSelectedType("");
    loadDocumentations({ doc_type: "", search: "" });
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    updateFilters({ doc_type: type });
    loadDocumentations({ doc_type: type });
  };

  if (loading && documentations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Documentation"
        description={error}
        onRetry={() => loadDocumentations()}
      />
    );
  }

  const hasActiveFilters = filters.doc_type || filters.search;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Documentation</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage project documentation and technical guides
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() =>
            navigate(`/projects/${projectId}/documentation/create`)
          }
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Create Documentation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Total Documents</p>
          <p className="text-2xl font-bold text-neutral-900">
            {pagination.total}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">API Docs</p>
          <p className="text-2xl font-bold text-neutral-900">
            {documentations.filter((d) => d.doc_type === "api").length}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Technical</p>
          <p className="text-2xl font-bold text-neutral-900">
            {documentations.filter((d) => d.doc_type === "technical").length}
          </p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <p className="text-sm text-neutral-500">Manuals</p>
          <p className="text-2xl font-bold text-neutral-900">
            {documentations.filter((d) => d.doc_type === "user_manual").length}
          </p>
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
              placeholder="Search documentation..."
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
                {selectedType ? getDocTypeLabel(selectedType) : "All Types"}
                <ChevronDown size={14} />
              </Button>
            }
          >
            <DropdownItem onClick={() => handleTypeSelect("")}>
              All Types
            </DropdownItem>
            {DOCUMENTATION_TYPES.map((type) => (
              <DropdownItem
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
              >
                {type.label}
              </DropdownItem>
            ))}
          </Dropdown>

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

      {/* Documentation Grid/List */}
      {documentations.length === 0 ? (
        <EmptyState
          title="No Documentation Found"
          description={
            searchQuery
              ? `No results found for "${searchQuery}"`
              : "No documentation has been created for this project yet."
          }
          action={
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/projects/${projectId}/documentation/create`)
              }
            >
              Create First Document
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
            {documentations.map((doc) => (
              <DocumentationCard
                key={doc.id}
                {...doc}
                projectId={projectId}
                viewMode={viewMode}
              />
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

export default DocumentationList;
