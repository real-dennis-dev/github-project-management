// src/components/techdebt/TechDebtList.jsx
import React, { useEffect, useState } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Button,
  SearchBar,
} from "../common";
import TechDebtCard from "./TechDebtCard";
import TechDebtFilters from "./TechDebtFilters";
import { AlertTriangle, Plus } from "lucide-react";

const TechDebtList = ({ projectId }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    getItems,
    items,
    pagination,
    isLoading,
    error,
    clearError,
    filters,
    setFilters,
  } = useTechDebt();
  const { toast } = useToast();

  const limit = 12;

  useEffect(() => {
    if (projectId) {
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        ...filters,
      };
      getItems(projectId, params);
    }
  }, [projectId, page, searchTerm, filters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (isLoading && items.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No Tech Debt Items"
        description="No technical debt items have been identified for this project yet."
        icon={<AlertTriangle className="w-12 h-12 text-neutral-400" />}
        action={
          <Button variant="primary" href={`/tech-debt/${projectId}/new`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tech Debt
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-neutral-900">Technical Debt</h2>
        <Button variant="primary" href={`/tech-debt/${projectId}/new`}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tech Debt
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search tech debt..."
          className="flex-1"
        />
        <TechDebtFilters onFilterChange={handleFilterChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <TechDebtCard key={item.id} item={item} projectId={projectId} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TechDebtList;
