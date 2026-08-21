// src/components/decision-risks/RiskStatistics.jsx
import React from "react";
import { Card } from "../common";
import { getRiskStatusBadge } from "../../hooks/useDecisionRisk";

const RiskStatistics = ({ risks }) => {
  if (!risks || risks.length === 0) return null;

  // Calculate statistics
  const total = risks.length;
  const byLevel = risks.reduce((acc, risk) => {
    acc[risk.risk_level] = (acc[risk.risk_level] || 0) + 1;
    return acc;
  }, {});

  const byStatus = risks.reduce((acc, risk) => {
    acc[risk.status] = (acc[risk.status] || 0) + 1;
    return acc;
  }, {});

  const criticalCount = byLevel.critical || 0;
  const highCount = byLevel.high || 0;
  const openRisks =
    (byStatus.identified || 0) +
    (byStatus.monitoring || 0) +
    (byStatus.mitigated || 0);

  const getLevelColor = (level) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      critical: "text-red-600",
    };
    return colors[level] || "text-neutral-600";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-sm text-neutral-500">Total Risks</div>
          <div className="text-2xl font-bold text-neutral-900">{total}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-neutral-500">Open Risks</div>
          <div className="text-2xl font-bold text-blue-600">{openRisks}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-neutral-500">Critical</div>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm text-neutral-500">High</div>
          <div className="text-2xl font-bold text-orange-600">{highCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Level */}
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            Risk Levels
          </h4>
          <div className="space-y-2">
            {Object.entries(byLevel).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium capitalize ${getLevelColor(
                    level
                  )}`}
                >
                  {level}
                </span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Status */}
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            Risk Statuses
          </h4>
          <div className="space-y-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {getRiskStatusBadge(status)}
                </span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskStatistics;
