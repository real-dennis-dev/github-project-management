// src/components/decision-risks/RisksList.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  SearchBar,
  Table,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Alert,
  Modal,
  Badge,
} from "../common";
import {
  useRisks,
  RISK_LEVELS,
  RISK_STATUSES,
  getRiskLevelColor,
  getRiskStatusColor,
  getRiskStatusBadge,
} from "../../hooks/useDecisionRisk";
import RiskCard from "./RiskCard";
import RiskFilters from "./RiskFilters";
import RiskStatistics from "./RiskStatistics";

const RisksList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    level: "",
    status: "",
  });
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    risks,
    loading,
    error,
    pagination,
    riskScore,
    params,
    deleteRisk,
    changePage,
    changeLimit,
    updateParams,
  } = useRisks(projectId);

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
    if (selectedRisk) {
      const success = await deleteRisk(selectedRisk.id);
      if (success) {
        setShowDeleteModal(false);
        setSelectedRisk(null);
      }
    }
  };

  // Table columns
  const columns = [
    { key: "title", label: "Risk" },
    { key: "risk_level", label: "Level" },
    { key: "status", label: "Status" },
    { key: "risk_score", label: "Score" },
    { key: "created_at", label: "Created" },
  ];

  // Format table data
  const tableData = risks.map((risk) => ({
    ...risk,
    risk_level: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
          risk.risk_level
        )}`}
      >
        {risk.risk_level}
      </span>
    ),
    status: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStatusColor(
          risk.status
        )}`}
      >
        {getRiskStatusBadge(risk.status)}
      </span>
    ),
    risk_score: risk.risk_score || "-",
    created_at: new Date(risk.created_at).toLocaleDateString(),
  }));

  if (loading && !risks.length) {
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

  // Risk score summary
  const getRiskLevelSummary = () => {
    if (!riskScore) return null;
    const { totalRisks, criticalCount, highCount, riskLevel } = riskScore;
    return (
      <div className="flex items-center gap-6">
        <div>
          <span className="text-sm text-neutral-500">Total Risks</span>
          <p className="text-2xl font-bold">{totalRisks}</p>
        </div>
        <div>
          <span className="text-sm text-neutral-500">Critical</span>
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div>
          <span className="text-sm text-neutral-500">High</span>
          <p className="text-2xl font-bold text-orange-600">{highCount}</p>
        </div>
        <div>
          <span className="text-sm text-neutral-500">Overall Level</span>
          <Badge
            variant={
              riskLevel === "critical"
                ? "error"
                : riskLevel === "high"
                ? "warning"
                : riskLevel === "medium"
                ? "info"
                : "success"
            }
            size="lg"
          >
            {riskLevel.toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Risks</h1>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/risks/dashboard")}
          >
            Dashboard
          </Button>
          <Button onClick={() => navigate("new")}>New Risk</Button>
        </div>
      </div>

      {/* Risk Score Summary */}
      {riskScore && (
        <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          {getRiskLevelSummary()}
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6">
        <RiskStatistics risks={risks} />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search risks..."
          fullWidth
        />

        {showFilters && (
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <RiskFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              levelOptions={RISK_LEVELS}
              statusOptions={RISK_STATUSES}
            />
          </div>
        )}
      </div>

      {/* Risks Grid */}
      {risks.length === 0 ? (
        <EmptyState
          title="No risks found"
          description="Identify and track project risks to ensure successful delivery."
          action={
            <Button variant="primary" onClick={() => navigate("new")}>
              Create Risk
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {risks.map((risk) => (
              <RiskCard
                key={risk.id}
                risk={risk}
                onEdit={() => navigate(`/risks/${risk.id}/edit`)}
                onDelete={() => {
                  setSelectedRisk(risk);
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
              onRowClick={(row) => navigate(`/risks/${row.id}`)}
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
          setSelectedRisk(null);
        }}
        title="Delete Risk"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete "{selectedRisk?.title}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRisk(null);
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

export default RisksList;
