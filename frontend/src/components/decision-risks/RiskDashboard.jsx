// src/components/decision-risks/RiskDashboard.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, LoadingSpinner, Alert, Badge } from "../common";
import {
  useRisks,
  getRiskStatusBadge,
  getRiskLevelColor,
} from "../../hooks/useDecisionRisk";
import RiskMatrix from "./RiskMatrix";

const RiskDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    risks,
    loading,
    error,
    riskScore,
    riskReport,
    riskMatrix,
    fetchRiskReport,
    fetchRiskMatrix,
    getRiskLevelColor,
  } = useRisks(projectId);

  useEffect(() => {
    if (projectId) {
      fetchRiskReport();
      fetchRiskMatrix();
    }
  }, [projectId, fetchRiskReport, fetchRiskMatrix]);

  if (loading) {
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

  // Group risks by status
  const risksByStatus = risks.reduce((acc, risk) => {
    if (!acc[risk.status]) acc[risk.status] = [];
    acc[risk.status].push(risk);
    return acc;
  }, {});

  // Group risks by level
  const risksByLevel = risks.reduce((acc, risk) => {
    if (!acc[risk.risk_level]) acc[risk.risk_level] = [];
    acc[risk.risk_level].push(risk);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Risk Dashboard</h1>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => navigate("/risks")}>
            Back to Risks
          </Button>
          <Button onClick={() => navigate("/risks/new")}>New Risk</Button>
        </div>
      </div>

      {/* Risk Score Summary */}
      {riskScore && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Total Risks</div>
            <div className="text-2xl font-bold">{riskScore.totalRisks}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Critical</div>
            <div className="text-2xl font-bold text-red-600">
              {riskScore.criticalCount}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">High</div>
            <div className="text-2xl font-bold text-orange-600">
              {riskScore.highCount}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-neutral-500">Overall Risk Level</div>
            <Badge
              variant={
                riskScore.riskLevel === "critical"
                  ? "error"
                  : riskScore.riskLevel === "high"
                  ? "warning"
                  : riskScore.riskLevel === "medium"
                  ? "info"
                  : "success"
              }
              size="lg"
              className="mt-1 text-lg"
            >
              {riskScore.riskLevel.toUpperCase()}
            </Badge>
          </Card>
        </div>
      )}

      {/* Risk Matrix */}
      {riskMatrix && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Risk Matrix</h2>
          <RiskMatrix matrix={riskMatrix} />
        </div>
      )}

      {/* Risks by Status */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Risks by Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(risksByStatus).map(([status, items]) => (
            <Card key={status} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {getRiskStatusBadge(status)}
                </span>
                <Badge variant="neutral">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.slice(0, 3).map((risk) => (
                  <div
                    key={risk.id}
                    className="text-sm p-2 bg-neutral-50 rounded cursor-pointer hover:bg-neutral-100"
                    onClick={() => navigate(`/risks/${risk.id}`)}
                  >
                    {risk.title}
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-sm text-neutral-400">
                    +{items.length - 3} more
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Risks by Level */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Risks by Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(risksByLevel).map(([level, items]) => (
            <Card key={level} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(
                    level
                  )}`}
                >
                  {level.toUpperCase()}
                </span>
                <Badge variant="neutral">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.slice(0, 2).map((risk) => (
                  <div
                    key={risk.id}
                    className="text-sm p-2 bg-neutral-50 rounded cursor-pointer hover:bg-neutral-100"
                    onClick={() => navigate(`/risks/${risk.id}`)}
                  >
                    {risk.title}
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-sm text-neutral-400">
                    +{items.length - 2} more
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Risk Report Summary */}
      {riskReport && riskReport.summary && (
        <div className="mt-8 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h3 className="font-semibold mb-2">Risk Report Summary</h3>
          <p className="text-neutral-600">{riskReport.summary}</p>
          <div className="mt-2 text-sm text-neutral-400">
            Generated: {new Date(riskReport.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;
