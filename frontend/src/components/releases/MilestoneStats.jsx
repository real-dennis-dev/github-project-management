// src/components/releases/MilestoneStats.jsx
import React, { useEffect } from "react";
import { useReleases } from "../../hooks/useReleases";
import { LoadingSpinner, Alert, Badge } from "../common";
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const MilestoneStats = ({ projectId }) => {
  const {
    getMilestoneStats,
    milestoneStats,
    isMilestoneStatsLoading,
    error,
    clearError,
  } = useReleases();

  useEffect(() => {
    if (projectId) {
      getMilestoneStats(projectId);
    }
  }, [projectId]);

  if (isMilestoneStatsLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!milestoneStats) {
    return null;
  }

  const stats = [
    {
      label: "Total Milestones",
      value: milestoneStats.total || 0,
      icon: TrendingUp,
      color: "primary",
    },
    {
      label: "Completed",
      value: milestoneStats.byStatus?.completed || 0,
      icon: CheckCircle,
      color: "success",
    },
    {
      label: "In Progress",
      value: milestoneStats.byStatus?.in_progress || 0,
      icon: Clock,
      color: "warning",
    },
    {
      label: "Not Started",
      value: milestoneStats.byStatus?.not_started || 0,
      icon: Clock,
      color: "secondary",
    },
    {
      label: "Delayed",
      value: milestoneStats.byStatus?.delayed || 0,
      icon: AlertTriangle,
      color: "error",
    },
    {
      label: "Overdue",
      value: milestoneStats.overdueCount || 0,
      icon: AlertTriangle,
      color: "error",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-neutral-500">Average Progress</p>
            <p className="text-2xl font-bold text-neutral-900">
              {milestoneStats.averageProgress || 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Completion Rate</p>
            <p className="text-2xl font-bold text-neutral-900">
              {milestoneStats.completionRate || 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Overdue</p>
            <Badge
              variant={milestoneStats.overdueCount > 0 ? "error" : "success"}
            >
              {milestoneStats.overdueCount || 0}
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {milestoneStats.byStatus && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm font-medium text-neutral-700 mb-3">
            Status Breakdown
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(milestoneStats.byStatus).map(([status, count]) => (
              <Badge
                key={status}
                variant={
                  status === "completed"
                    ? "success"
                    : status === "in_progress"
                    ? "warning"
                    : status === "delayed"
                    ? "error"
                    : "neutral"
                }
                size="lg"
              >
                {status.replace("_", " ")}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneStats;
