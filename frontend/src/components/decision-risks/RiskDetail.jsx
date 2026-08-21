// src/components/decision-risks/RiskDetail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  LoadingSpinner,
  Alert,
  Badge,
  IconWrapper,
  Select,
} from "../common";
import {
  useRisks,
  RISK_STATUSES,
  getRiskLevelColor,
  getRiskStatusColor,
  getRiskStatusBadge,
} from "../../hooks/useDecisionRisk";
import { FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";

const RiskDetail = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const { getRisk, updateRiskStatus, deleteRisk, loading, error } =
    useRisks(projectId);
  const [risk, setRisk] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await getRisk(id);
        if (response.success && response.data) {
          setRisk(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch risk:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRisk();
  }, [id, getRisk]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusUpdateLoading(true);
    try {
      const result = await updateRiskStatus(id, newStatus);
      if (result) {
        setRisk((prev) => ({ ...prev, status: newStatus }));
      }
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this risk?")) {
      const success = await deleteRisk(id);
      if (success) {
        navigate("/risks");
      }
    }
  };

  if (initialLoading) {
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

  if (!risk) {
    return (
      <Alert variant="info" title="Not Found">
        Risk not found.
      </Alert>
    );
  }

  const statusOptions = RISK_STATUSES.map((status) => ({
    value: status,
    label: getRiskStatusBadge(status),
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/risks")}
          className="p-2"
        >
          <IconWrapper icon={FiArrowLeft} size="lg" />
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900 flex-1">
          {risk.title}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/risks/${id}/edit`)}
          >
            <IconWrapper icon={FiEdit2} size="sm" className="mr-1" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <IconWrapper icon={FiTrash2} size="sm" className="mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Badge
          variant={
            risk.risk_level === "critical"
              ? "error"
              : risk.risk_level === "high"
              ? "warning"
              : risk.risk_level === "medium"
              ? "info"
              : "success"
          }
          size="md"
        >
          Level: {risk.risk_level}
        </Badge>
        <Badge
          variant={
            risk.status === "realized"
              ? "error"
              : risk.status === "mitigated" || risk.status === "closed"
              ? "success"
              : risk.status === "monitoring"
              ? "warning"
              : "info"
          }
          size="md"
        >
          Status: {getRiskStatusBadge(risk.status)}
        </Badge>
        {risk.risk_score && (
          <Badge variant="neutral" size="md">
            Score: {risk.risk_score}
          </Badge>
        )}
        <Badge variant="neutral" size="md">
          Created: {new Date(risk.created_at).toLocaleDateString()}
        </Badge>
      </div>

      {/* Status Update */}
      <div className="mb-6">
        <Select
          label="Update Status"
          value={risk.status}
          onChange={handleStatusChange}
          options={statusOptions}
          disabled={statusUpdateLoading}
          fullWidth={false}
          className="max-w-xs"
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {risk.description && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Description
            </h2>
            <p className="text-neutral-700">{risk.description}</p>
          </Card>
        )}

        {risk.reason && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Reason
            </h2>
            <p className="text-neutral-700">{risk.reason}</p>
          </Card>
        )}

        {risk.mitigation && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Mitigation Strategy
            </h2>
            <p className="text-neutral-700">{risk.mitigation}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiskDetail;
