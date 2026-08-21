// src/components/tech-debt/TechDebtDashboard.jsx

import React, { useState } from "react";
import {
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  IconWrapper,
  ProgressBar,
  Card,
} from "../common";
import useTechDebt from "./useTechDebt";
import {
  PRIORITIES,
  STATUSES,
  getPriority,
  getPriorityLabel,
  getPriorityColor,
  getPriorityIcon,
  getStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  SCORE_LEVELS,
} from "./TechDebtConstants";

const TechDebtDashboard = () => {
  const {
    overview,
    score,
    statistics,
    suggestions,
    loading,
    error,
    fetchOverview,
    fetchScore,
    fetchStatistics,
    fetchSuggestions,
    navigateToNew,
    navigateToDetail,
  } = useTechDebt();

  const [refreshing, setRefreshing] = useState(false);

  // Refresh all data
  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchOverview(),
      fetchScore(),
      fetchStatistics(),
      fetchSuggestions(),
    ]);
    setRefreshing(false);
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading dashboard">
          {error}
        </Alert>
      </div>
    );
  }

  // Get score level
  const scoreLevel = score ? SCORE_LEVELS[score.level] : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tech Debt Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Overview of your technical debt landscape
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            loading={refreshing}
          >
            <IconWrapper icon="🔄" size="sm" />
            Refresh
          </Button>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Tech Debt
          </Button>
        </div>
      </div>

      {/* Score Card */}
      {score && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: `conic-gradient(${
                      scoreLevel?.color || "#10B981"
                    } ${score.score}%, #e5e5e5 ${score.score}%)`,
                  }}
                >
                  <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center">
                    {score.score}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Tech Debt Score
                </p>
                <p className="text-xl font-bold">{score.score}%</p>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: scoreLevel?.color + "20",
                    color: scoreLevel?.color,
                  }}
                >
                  {scoreLevel?.label || "Medium"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Total Items</p>
                <p className="font-bold">{score.totalItems || 0}</p>
              </div>
              <div>
                <p className="text-neutral-500">Resolution Rate</p>
                <p className="font-bold">{score.resolutionRate || 0}%</p>
              </div>
              <div>
                <p className="text-neutral-500">Estimated Effort</p>
                <p className="font-bold">{score.estimatedEffort || 0}h</p>
              </div>
              <div>
                <p className="text-neutral-500">Unresolved</p>
                <p className="font-bold">{score.unresolvedItems || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Breakdown */}
      {overview?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Priority Breakdown</h2>
            <div className="space-y-3">
              {PRIORITIES.map((priority) => {
                const count =
                  overview.metrics.byPriority?.[priority.value] || 0;
                const total = overview.metrics.total || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={priority.value} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{priority.icon}</span>
                        <span>{priority.label}</span>
                      </span>
                      <span className="font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      max={100}
                      variant={
                        priority.value === "critical" ||
                        priority.value === "high"
                          ? "error"
                          : "primary"
                      }
                      size="sm"
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
            <div className="space-y-3">
              {STATUSES.map((status) => {
                const count = overview.metrics.byStatus?.[status.value] || 0;
                const total = overview.metrics.total || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status.value} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        <span>{status.label}</span>
                      </span>
                      <span className="font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      max={100}
                      variant={
                        status.value === "resolved"
                          ? "success"
                          : status.value === "in_progress"
                          ? "warning"
                          : "primary"
                      }
                      size="sm"
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {statistics?.metrics && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Total Debt Items</p>
              <p className="text-2xl font-bold text-primary-500">
                {statistics.metrics.total || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg. Priority Score</p>
              <p className="text-2xl font-bold">
                {statistics.metrics.averagePriority || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Estimated Effort</p>
              <p className="text-2xl font-bold text-info">
                {statistics.metrics.totalEffort || 0}h
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg. Resolution Time</p>
              <p className="text-2xl font-bold text-success">
                {statistics.metrics.averageResolutionTime || 0} days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refactoring Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Refactoring Suggestions
          </h2>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                onClick={() => navigateToDetail(suggestion.id)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{suggestion.title}</h3>
                    {suggestion.suggestion && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {suggestion.suggestion.recommendedAction}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {suggestion.suggestion && (
                      <Badge
                        variant={
                          suggestion.suggestion.priority === "critical" ||
                          suggestion.suggestion.priority === "high"
                            ? "error"
                            : "info"
                        }
                      >
                        {suggestion.suggestion.priority}
                      </Badge>
                    )}
                    {suggestion.effort && (
                      <Badge variant="secondary">
                        {suggestion.effort}h effort
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetail(suggestion.id);
                      }}
                    >
                      View →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {score?.recommendations && score.recommendations.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {score.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary-500 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Action */}
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" onClick={navigateToNew}>
          <IconWrapper icon="➕" size="sm" />
          Add New Tech Debt
        </Button>
        <Button variant="outline" onClick={() => navigate("/tech-debt")}>
          View All Items
        </Button>
      </div>
    </div>
  );
};

export default TechDebtDashboard;
