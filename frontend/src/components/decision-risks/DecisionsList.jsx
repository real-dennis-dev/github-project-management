// src/components/decision-risks/DecisionsList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Input,
  SearchBar,
  Table,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Alert,
  Modal,
} from "../common";
import { useDecisions, IMPACT_LEVELS } from "../../hooks/useDecisionRisk";
import DecisionCard from "./DecisionCard";
import DecisionFilters from "./DecisionFilters";
import DecisionStatistics from "./DecisionStatistics";

const DecisionsList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    impact: "",
    fromDate: "",
    toDate: "",
  });
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    decisions,
    loading,
    error,
    pagination,
    statistics,
    params,
    deleteDecision,
    changePage,
    changeLimit,
    updateParams,
    getImpactColor,
  } = useDecisions(projectId);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    updateParams({ search: value });
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateParams(newFilters);
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedDecision) {
      const success = await deleteDecision(selectedDecision.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedDecision(null);
      }
    }
  };

  // Table columns
  const columns = [
    { key: "title", label: "Title" },
    { key: "impact", label: "Impact" },
    { key: "decision", label: "Decision" },
    { key: "decision_date", label: "Date" },
  ];

  // Format table data
  const tableData = decisions.map((decision) => ({
    ...decision,
    impact: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
          decision.impact
        )}`}
      >
        {decision.impact}
      </span>
    ),
    decision_date: decision.decision_date
      ? new Date(decision.decision_date).toLocaleDateString()
      : "-",
  }));

  if (loading && !decisions.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Decisions</h1>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button onClick={() => navigate("new")}>New Decision</Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="mb-6">
          <DecisionStatistics statistics={statistics} />
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search decisions..."
          fullWidth
        />

        {showFilters && (
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <DecisionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              impactOptions={IMPACT_LEVELS}
            />
          </div>
        )}
      </div>

      {/* Decisions Grid */}
      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions found"
          description="Start documenting your project decisions by creating a new decision record."
          action={
            <Button variant="primary" onClick={() => navigate("new")}>
              Create Decision
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {decisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onEdit={() => navigate(`/decisions/${decision.id}/edit`)}
                onDelete={() => {
                  setSelectedDecision(decision);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block">
            <Table
              headers={columns}
              data={tableData}
              variant="striped"
              onRowClick={(row) => navigate(`/decisions/${row.id}`)}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={changePage}
              />
              <div className="mt-2 text-sm text-neutral-500 text-center">
                Showing {pagination.page} of {pagination.totalPages} pages (
                {pagination.total} total)
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDecision(null);
        }}
        title="Delete Decision"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete "{selectedDecision?.title}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedDecision(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DecisionsList;
