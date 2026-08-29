// src/components/techdebt/TechDebtOverview.jsx
import React, { useEffect } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { LoadingSpinner, Alert, Badge, ProgressBar } from "../common";
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import TechDebtStatusBadge from "./TechDebtStatusBadge";
import { AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";

const TechDebtOverview = ({ projectId }) => {
  const { getOverview, overview, isLoading, error, clearError } = useTechDebt();

  useEffect(() => {
    if (projectId) {
      getOverview(projectId);
    }
  }, [projectId]);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No overview data available.
      </div>
    );
  }

  const {
    metrics,
    prioritizedItems,
    totalEstimatedCost,
    summary,
    lastUpdated,
  } = overview;

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const statsCards = [
    {
      label: "Total Items",
      value: metrics?.total || 0,
      icon: AlertTriangle,
      color: "neutral",
    },
    {
      label: "Resolution Rate",
      value: `${metrics?.resolutionRate || 0}%`,
      icon: CheckCircle,
      color: "success",
    },
    {
      label: "Total Effort",
      value: `${metrics?.totalEffort || 0}h`,
      icon: Clock,
      color: "info",
    },
    {
      label: "Estimated Cost",
      value: `$${totalEstimatedCost || 0}`,
      icon: Zap,
      color: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 text-${stat.color}-500 opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Distribution */}
      {metrics?.byPriority && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Priority Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.byPriority).map(([priority, count]) => (
              <div key={priority} className="text-center">
                <TechDebtPriorityBadge priority={priority} />
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Distribution */}
      {metrics?.byStatus && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Status Distribution
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <TechDebtStatusBadge status={status} />
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prioritized Items */}
      {prioritizedItems && prioritizedItems.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Top Priority Items
          </h4>
          <div className="space-y-2">
            {prioritizedItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg"
              >
                <span className="text-sm text-neutral-800">{item.title}</span>
                <div className="flex items-center space-x-2">
                  <TechDebtPriorityBadge priority={item.priority} size="sm" />
                  <TechDebtStatusBadge status={item.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Summary</h4>
          <p className="text-neutral-600">{summary}</p>
        </div>
      )}

      {lastUpdated && (
        <p className="text-xs text-neutral-500 text-right">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
    </div>
  );
};

export default TechDebtOverview;
