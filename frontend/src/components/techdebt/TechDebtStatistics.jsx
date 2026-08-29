// src/components/techdebt/TechDebtStatistics.jsx
import React, { useEffect } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { LoadingSpinner, Alert, Badge } from "../common";
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import TechDebtStatusBadge from "./TechDebtStatusBadge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const TechDebtStatistics = ({ projectId }) => {
  const { getStatistics, statistics, isLoading, error, clearError } =
    useTechDebt();

  useEffect(() => {
    if (projectId) {
      getStatistics(projectId);
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

  if (!statistics) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No statistics available.
      </div>
    );
  }

  const { metrics, topPriorities, trendData, totalCost } = statistics;

  const statCards = [
    {
      label: "Total Items",
      value: metrics?.total || 0,
      icon: BarChart3,
      color: "neutral",
    },
    {
      label: "Total Cost",
      value: `$${totalCost || 0}`,
      icon: TrendingUp,
      color: "warning",
    },
    {
      label: "Resolution Rate",
      value: `${metrics?.resolutionRate || 0}%`,
      icon: CheckCircle,
      color: "success",
    },
    {
      label: "Average Impact",
      value: metrics?.averageImpact || 0,
      icon: AlertTriangle,
      color: "info",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          Tech Debt Statistics
        </h2>
        <Badge variant="info" size="lg">
          Updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
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

      {/* Top Priorities */}
      {topPriorities && topPriorities.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Top Priority Items
          </h4>
          <div className="space-y-2">
            {topPriorities.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-neutral-500">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-neutral-800">
                    {item.title || item}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.priority && (
                    <TechDebtPriorityBadge priority={item.priority} size="sm" />
                  )}
                  {item.status && (
                    <TechDebtStatusBadge status={item.status} size="sm" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Data */}
      {trendData && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Trend Analysis
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-neutral-500">New This Month</p>
              <p className="text-xl font-bold text-warning">
                {trendData.newThisMonth || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Resolved This Month</p>
              <p className="text-xl font-bold text-success">
                {trendData.resolvedThisMonth || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Trend Direction</p>
              <div className="flex items-center space-x-1">
                {trendData.trendDirection === "improving" ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-success" />
                    <span className="text-success">Improving</span>
                  </>
                ) : trendData.trendDirection === "worsening" ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-error" />
                    <span className="text-error">Worsening</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 text-neutral-500" />
                    <span className="text-neutral-500">Stable</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Average Age (days)</p>
              <p className="text-xl font-bold text-info">
                {trendData.averageAge || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Priority Breakdown */}
      {metrics?.byPriority && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Priority Breakdown
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

      {/* Status Breakdown */}
      {metrics?.byStatus && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Status Breakdown
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
    </div>
  );
};

export default TechDebtStatistics;
