// src/components/decision-risks/components/RiskList.jsx
import React, { useState } from "react";
import { useDecisionsRisks } from "../hooks/useDecisionsRisks";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { Pagination } from "../../../components/common/Pagination";
import RiskCard from "./RiskCard";
import RiskForm from "./RiskForm";
import RiskMatrix from "./RiskMatrix";
import RiskScore from "./RiskScore";
import { Modal } from "../../../components/common/Modal";
import {
  Plus,
  Search,
  Filter,
  X,
  RefreshCw,
  LayoutGrid,
  BarChart,
} from "lucide-react";
import { useToast } from "../../../hooks/useToast";

const RiskList = ({ projectId }) => {
  const {
    risks,
    risksMeta,
    riskScore,
    riskMatrix,
    riskFilters,
    setRiskFilters,
    resetRiskFilters,
    deleteRisk,
    isDeletingRisk,
    isRisksLoading,
    fetchRiskScore,
    fetchRiskMatrix,
    clearError,
    error,
  } = useDecisionsRisks();

  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteRisk(id);
      toast.success("Risk deleted successfully");
    } catch (err) {
      toast.error("Failed to delete risk");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (risk) => {
    setEditingRisk(risk);
  };

  const handlePageChange = (page) => {
    setRiskFilters({ page });
  };

  const handleFilterChange = (key, value) => {
    setRiskFilters({ [key]: value, page: 1 });
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "identified", label: "Identified" },
    { value: "monitoring", label: "Monitoring" },
    { value: "mitigated", label: "Mitigated" },
    { value: "realized", label: "Realized" },
    { value: "closed", label: "Closed" },
  ];

  const levelOptions = [
    { value: "", label: "All Levels" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Created Date" },
    { value: "risk_level", label: "Risk Level" },
    { value: "status", label: "Status" },
  ];

  if (isRisksLoading && risks.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load risks"
        description={error}
        onRetry={() => {
          clearError();
          window.location.reload();
        }}
      />
    );
  }

  const filteredRisks = risks.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Risks
          </h2>
          {riskScore && (
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Total: <strong>{riskScore.totalRisks}</strong>
              </span>
              <Badge
                variant={
                  riskScore.riskLevel === "critical" ? "error" : "warning"
                }
                size="sm"
              >
                Overall: {riskScore.riskLevel}
              </Badge>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Avg Score: <strong>{riskScore.averageScore}</strong>
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "list" ? "matrix" : "list")}
          >
            {viewMode === "list" ? (
              <>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Matrix View
              </>
            ) : (
              <>
                <BarChart className="w-4 h-4 mr-2" />
                List View
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRiskScore();
              fetchRiskMatrix();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Risk
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search risks..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={riskFilters.level || ""}
          onChange={(e) => handleFilterChange("level", e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {levelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={riskFilters.status || ""}
          onChange={(e) => handleFilterChange("status", e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={riskFilters.sortBy || "created_at"}
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
          onClick={resetRiskFilters}
          className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
          aria-label="Reset filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Risk Score Summary */}
      {riskScore && viewMode === "list" && <RiskScore score={riskScore} />}

      {/* Risk Matrix View */}
      {viewMode === "matrix" && riskMatrix && (
        <RiskMatrix matrix={riskMatrix} />
      )}

      {/* Risk List */}
      {viewMode === "list" && (
        <>
          {filteredRisks.length === 0 ? (
            <EmptyState
              title="No risks found"
              description={
                searchTerm
                  ? "Try adjusting your search or filters"
                  : "Create your first risk for this project"
              }
              action={
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Risk
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRisks.map((risk) => (
                <RiskCard
                  key={risk.id}
                  risk={risk}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === risk.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {risksMeta && risksMeta.pagination && viewMode === "list" && (
        <Pagination
          currentPage={risksMeta.pagination.page}
          totalPages={risksMeta.pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Risk"
        size="lg"
      >
        <RiskForm
          projectId={projectId}
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success("Risk created successfully");
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingRisk}
        onClose={() => setEditingRisk(null)}
        title="Edit Risk"
        size="lg"
      >
        <RiskForm
          projectId={projectId}
          risk={editingRisk}
          isEdit
          onSuccess={() => {
            setEditingRisk(null);
            toast.success("Risk updated successfully");
          }}
          onCancel={() => setEditingRisk(null)}
        />
      </Modal>
    </div>
  );
};

export default RiskList;
