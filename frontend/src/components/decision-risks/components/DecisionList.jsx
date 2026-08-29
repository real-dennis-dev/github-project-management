// src/components/decision-risks/components/DecisionList.jsx
import React, { useState } from "react";
import { useDecisionsRisks } from "../hooks/useDecisionsRisks";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Badge } from "../../../components/common/Badge";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { Pagination } from "../../../components/common/Pagination";
import DecisionCard from "./DecisionCard";
import DecisionForm from "./DecisionForm";
import { Modal } from "../../../components/common/Modal";
import { Plus, Search, Filter, X, RefreshCw, BarChart } from "lucide-react";
import { useToast } from "../../../hooks/useToast";

const DecisionList = ({ projectId }) => {
  const {
    decisions,
    decisionsMeta,
    decisionStats,
    decisionFilters,
    setDecisionFilters,
    resetDecisionFilters,
    deleteDecision,
    isDeletingDecision,
    isDecisionsLoading,
    fetchDecisionStats,
    clearError,
    error,
  } = useDecisionsRisks();

  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDecision, setEditingDecision] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteDecision(id);
      toast.success("Decision deleted successfully");
    } catch (err) {
      toast.error("Failed to delete decision");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (decision) => {
    setEditingDecision(decision);
  };

  const handlePageChange = (page) => {
    setDecisionFilters({ page });
  };

  const handleFilterChange = (key, value) => {
    setDecisionFilters({ [key]: value, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the API, we need to refetch
    // The hook will automatically refetch when filters change
  };

  const impactOptions = [
    { value: "", label: "All Impacts" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "decision_date", label: "Decision Date" },
    { value: "impact", label: "Impact Level" },
  ];

  if (isDecisionsLoading && decisions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load decisions"
        description={error}
        onRetry={() => {
          clearError();
          window.location.reload();
        }}
      />
    );
  }

  const filteredDecisions = decisions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Decisions
          </h2>
          {decisionStats && (
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Total: <strong>{decisionStats.total}</strong>
              </span>
              {decisionStats.byImpact &&
                Object.entries(decisionStats.byImpact).map(
                  ([impact, count]) => (
                    <Badge key={impact} variant="neutral" size="sm">
                      {impact}: {count}
                    </Badge>
                  )
                )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDecisionStats}>
            <BarChart className="w-4 h-4 mr-2" />
            Stats
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Decision
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search decisions..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </form>

        <select
          value={decisionFilters.impact || ""}
          onChange={(e) => handleFilterChange("impact", e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {impactOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={decisionFilters.sortBy || "created_at"}
          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={resetDecisionFilters}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
          aria-label="Reset filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      {decisionStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(decisionStats.byImpact || {}).map(
            ([impact, count]) => (
              <div
                key={impact}
                className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                  {impact}
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {count}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Decision List */}
      {filteredDecisions.length === 0 ? (
        <EmptyState
          title="No decisions found"
          description={
            searchTerm
              ? "Try adjusting your search or filters"
              : "Create your first decision for this project"
          }
          action={
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Decision
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDecisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === decision.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {decisionsMeta && decisionsMeta.pagination && (
        <Pagination
          currentPage={decisionsMeta.pagination.page}
          totalPages={decisionsMeta.pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Decision"
        size="lg"
      >
        <DecisionForm
          projectId={projectId}
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success("Decision created successfully");
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingDecision}
        onClose={() => setEditingDecision(null)}
        title="Edit Decision"
        size="lg"
      >
        <DecisionForm
          projectId={projectId}
          decision={editingDecision}
          isEdit
          onSuccess={() => {
            setEditingDecision(null);
            toast.success("Decision updated successfully");
          }}
          onCancel={() => setEditingDecision(null)}
        />
      </Modal>
    </div>
  );
};

export default DecisionList;
