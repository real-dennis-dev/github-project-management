// src/components/techdebt/TechDebtScore.jsx
import React, { useEffect } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { LoadingSpinner, Alert, Badge, ProgressBar } from "../common";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

const TechDebtScore = ({ projectId }) => {
  const { getScore, score, isLoading, error, clearError } = useTechDebt();

  useEffect(() => {
    if (projectId) {
      getScore(projectId);
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

  if (!score) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No score data available.
      </div>
    );
  }

  const {
    score: scoreValue,
    level,
    totalItems,
    criticalItems,
    highItems,
    mediumItems,
    lowItems,
    resolutionRate,
    estimatedEffort,
    unresolvedItems,
    recommendations,
  } = score;

  const getLevelColor = () => {
    switch (level) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  const getScoreColor = () => {
    if (scoreValue <= 25) return "success";
    if (scoreValue <= 50) return "info";
    if (scoreValue <= 75) return "warning";
    return "error";
  };

  const statCards = [
    {
      label: "Total Items",
      value: totalItems,
      icon: AlertTriangle,
      color: "neutral",
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      color: "success",
    },
    {
      label: "Estimated Effort",
      value: `${estimatedEffort}h`,
      icon: Clock,
      color: "info",
    },
    {
      label: "Unresolved",
      value: unresolvedItems,
      icon: AlertTriangle,
      color: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Tech Debt Score
            </h3>
            <p className="text-sm text-neutral-500">Overall health indicator</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold text-${getScoreColor()}-500`}>
              {scoreValue}
            </div>
            <Badge variant={getLevelColor()} size="lg">
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Badge>
          </div>
        </div>
        <ProgressBar
          value={scoreValue}
          max={100}
          variant={getScoreColor()}
          showLabel
          className="mt-4"
        />
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

      {/* Priority Breakdown */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">
          Priority Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-neutral-500">Critical</p>
            <p className="text-2xl font-bold text-error">{criticalItems}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">High</p>
            <p className="text-2xl font-bold text-warning">{highItems}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Medium</p>
            <p className="text-2xl font-bold text-info">{mediumItems}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Low</p>
            <p className="text-2xl font-bold text-neutral-500">{lowItems}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className="text-sm text-neutral-600 flex items-start"
              >
                <span className="text-primary-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TechDebtScore;
