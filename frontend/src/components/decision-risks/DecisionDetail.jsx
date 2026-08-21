// src/components/decision-risks/DecisionDetail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  LoadingSpinner,
  Alert,
  Badge,
  IconWrapper,
} from "../common";
import { useDecisions, getImpactColor } from "../../hooks/useDecisionRisk";
import { FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";

const DecisionDetail = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const { getDecision, deleteDecision, loading, error } =
    useDecisions(projectId);
  const [decision, setDecision] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const response = await getDecision(id);
        if (response.success && response.data) {
          setDecision(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch decision:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDecision();
  }, [id, getDecision]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this decision?")) {
      const success = await deleteDecision(id);
      if (success) {
        navigate("/decisions");
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

  if (!decision) {
    return (
      <Alert variant="info" title="Not Found">
        Decision not found.
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/decisions")}
          className="p-2"
        >
          <IconWrapper icon={FiArrowLeft} size="lg" />
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900 flex-1">
          {decision.title}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/decisions/${id}/edit`)}
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
            decision.impact === "critical"
              ? "error"
              : decision.impact === "high"
              ? "warning"
              : decision.impact === "medium"
              ? "info"
              : "success"
          }
          size="md"
        >
          Impact: {decision.impact}
        </Badge>
        {decision.decision_date && (
          <Badge variant="neutral" size="md">
            Date: {new Date(decision.decision_date).toLocaleDateString()}
          </Badge>
        )}
        <Badge variant="neutral" size="md">
          Created: {new Date(decision.created_at).toLocaleDateString()}
        </Badge>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Description
          </h2>
          <p className="text-neutral-700">{decision.description}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Decision
          </h2>
          <p className="text-neutral-700">{decision.decision}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Reason
          </h2>
          <p className="text-neutral-700">{decision.reason}</p>
        </Card>

        {decision.alternatives && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Alternatives Considered
            </h2>
            <p className="text-neutral-700">{decision.alternatives}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DecisionDetail;
