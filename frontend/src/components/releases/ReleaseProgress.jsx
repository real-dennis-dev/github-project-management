// src/components/releases/ReleaseProgress.jsx
import React, { useEffect } from "react";
import { useReleases } from "../../hooks/useReleases";
import { LoadingSpinner, Alert, ProgressBar, Badge } from "../common";
import { CheckCircle, Clock, AlertTriangle, GitBranch } from "lucide-react";

const ReleaseProgress = ({ releaseId }) => {
  const {
    getReleaseProgress,
    releaseProgress,
    isReleaseProgressLoading,
    error,
    clearError,
  } = useReleases();

  useEffect(() => {
    if (releaseId) {
      getReleaseProgress(releaseId);
    }
  }, [releaseId]);

  if (isReleaseProgressLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!releaseProgress) {
    return (
      <Alert variant="info">No progress data available for this release.</Alert>
    );
  }

  const getReadinessVariant = (readiness) => {
    const variants = {
      low: "error",
      medium: "warning",
      high: "info",
      ready: "success",
    };
    return variants[readiness] || "neutral";
  };

  const getReadinessIcon = (readiness) => {
    const icons = {
      low: AlertTriangle,
      medium: Clock,
      high: GitBranch,
      ready: CheckCircle,
    };
    return icons[readiness] || Clock;
  };

  const ReadinessIcon = getReadinessIcon(releaseProgress.readiness);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Progress</p>
          <div className="mt-2">
            <ProgressBar
              value={releaseProgress.percentage || 0}
              max={100}
              showLabel
              variant={
                releaseProgress.percentage >= 80
                  ? "success"
                  : releaseProgress.percentage >= 50
                  ? "primary"
                  : "warning"
              }
            />
          </div>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Total Features</p>
          <p className="text-2xl font-bold text-neutral-900">
            {releaseProgress.totalFeatures || 0}
          </p>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Completed</p>
          <p className="text-2xl font-bold text-success">
            {releaseProgress.completedFeatures || 0}
          </p>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Readiness</p>
          <Badge
            variant={getReadinessVariant(releaseProgress.readiness)}
            className="mt-1 flex items-center space-x-1"
          >
            <ReadinessIcon className="w-4 h-4" />
            <span className="capitalize">
              {releaseProgress.readiness || "Unknown"}
            </span>
          </Badge>
        </div>
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <p className="text-sm text-neutral-600">
          Status:{" "}
          <span className="font-medium text-neutral-900">
            {releaseProgress.status || "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ReleaseProgress;
