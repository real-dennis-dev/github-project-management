// src/components/releases/MilestoneProgress.jsx
import React, { useEffect } from "react";
import { useReleases } from "../../hooks/useReleases";
import { LoadingSpinner, Alert, ProgressBar, Badge } from "../common";
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const MilestoneProgress = ({ milestoneId }) => {
  const {
    getMilestoneProgress,
    milestoneProgress,
    isMilestoneProgressLoading,
    error,
    clearError,
  } = useReleases();

  useEffect(() => {
    if (milestoneId) {
      getMilestoneProgress(milestoneId);
    }
  }, [milestoneId]);

  if (isMilestoneProgressLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!milestoneProgress) {
    return (
      <Alert variant="info">
        No progress data available for this milestone.
      </Alert>
    );
  }

  const getStatusVariant = (status) => {
    const variants = {
      not_started: "secondary",
      in_progress: "warning",
      completed: "success",
      delayed: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: Clock,
      in_progress: TrendingUp,
      completed: CheckCircle,
      delayed: AlertTriangle,
    };
    return icons[status] || Clock;
  };

  const StatusIcon = getStatusIcon(milestoneProgress.status);

  return (
    <div className="space-y-4">
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Progress
        </h3>

        <div className="mb-4">
          <ProgressBar
            value={milestoneProgress.progress_percentage || 0}
            max={100}
            showLabel
            variant={
              milestoneProgress.progress_percentage >= 80
                ? "success"
                : milestoneProgress.progress_percentage >= 50
                ? "primary"
                : "warning"
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <StatusIcon
              className={`w-5 h-5 text-${getStatusVariant(
                milestoneProgress.status
              )}-500`}
            />
            <div>
              <p className="text-sm text-neutral-500">Status</p>
              <Badge variant={getStatusVariant(milestoneProgress.status)}>
                {milestoneProgress.status || "Unknown"}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Days Until Target</p>
            <p className="text-lg font-bold text-neutral-900">
              {milestoneProgress.days_until_target !== undefined
                ? milestoneProgress.days_until_target > 0
                  ? `${milestoneProgress.days_until_target} days`
                  : milestoneProgress.days_until_target === 0
                  ? "Due today"
                  : `${Math.abs(
                      milestoneProgress.days_until_target
                    )} days overdue`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Progress Percentage</p>
            <p className="text-lg font-bold text-neutral-900">
              {milestoneProgress.progress_percentage || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Visual progress bar representation */}
      {milestoneProgress.formatted && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500 mb-2">Visual Progress</p>
          <div className="font-mono text-sm text-neutral-800 bg-neutral-200 p-3 rounded-lg overflow-x-auto">
            {milestoneProgress.formatted}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneProgress;
