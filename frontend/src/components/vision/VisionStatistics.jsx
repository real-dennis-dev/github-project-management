// src/components/vision/VisionStatistics.jsx
import React from "react";
import { useVision } from "../../hooks/useVision";
import { LoadingSpinner, Alert, Badge } from "../common";
import { Target, CheckCircle, Clock, FileText, TrendingUp } from "lucide-react";

const VisionStatistics = () => {
  const { statistics, isStatisticsLoading, error, clearError } = useVision();

  if (isStatisticsLoading && !statistics) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!statistics) {
    return null;
  }

  const {
    total,
    byStatus,
    byCategory,
    averagePriority,
    averageProgress,
    completedCount,
    activeCount,
    draftCount,
  } = statistics;

  const statsCards = [
    {
      label: "Total Goals",
      value: total,
      icon: Target,
      color: "primary",
    },
    {
      label: "Active",
      value: activeCount || 0,
      icon: Clock,
      color: "info",
    },
    {
      label: "Completed",
      value: completedCount || 0,
      icon: CheckCircle,
      color: "success",
    },
    {
      label: "Draft",
      value: draftCount || 0,
      icon: FileText,
      color: "neutral",
    },
  ];

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {byStatus && Object.keys(byStatus).length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Status Breakdown
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([status, count]) => (
                <Badge key={status} variant="info" size="sm">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Metrics</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Average Priority</span>
              <span className="text-sm font-medium text-neutral-900">
                {averagePriority?.toFixed(1) || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Average Progress</span>
              <span className="text-sm font-medium text-neutral-900">
                {averageProgress || 0}%
              </span>
            </div>
            {byCategory && Object.keys(byCategory).length > 0 && (
              <div className="pt-2 border-t border-neutral-300">
                <p className="text-sm text-neutral-500 mb-1">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <Badge key={category} variant="secondary" size="sm">
                        {category}: {count}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionStatistics;
