// src/components/releases/ReleaseStats.jsx
import React, { useEffect } from "react";
import { useReleases } from "../../hooks/useReleases";
import { LoadingSpinner, Alert, Badge } from "../common";
import {
  Tag,
  CheckCircle,
  Clock,
  AlertTriangle,
  GitBranch,
  Calendar,
} from "lucide-react";

const ReleaseStats = ({ projectId }) => {
  const {
    getReleaseStats,
    releaseStats,
    isReleaseStatsLoading,
    error,
    clearError,
  } = useReleases();

  useEffect(() => {
    if (projectId) {
      getReleaseStats(projectId);
    }
  }, [projectId]);

  if (isReleaseStatsLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!releaseStats) {
    return null;
  }

  const statusColors = {
    planned: "secondary",
    in_progress: "warning",
    testing: "info",
    released: "success",
    cancelled: "error",
  };

  const statusIcons = {
    planned: Clock,
    in_progress: GitBranch,
    testing: AlertTriangle,
    released: CheckCircle,
    cancelled: Tag,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
          <Tag className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-neutral-900">
            {releaseStats.total || 0}
          </p>
          <p className="text-sm text-neutral-500">Total Releases</p>
        </div>

        {releaseStats.byStatus && (
          <>
            {Object.entries(releaseStats.byStatus).map(([status, count]) => {
              const Icon = statusIcons[status] || Tag;
              return (
                <div
                  key={status}
                  className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center"
                >
                  <Icon
                    className={`w-6 h-6 text-${statusColors[status]}-500 mx-auto mb-2`}
                  />
                  <p className="text-2xl font-bold text-neutral-900">{count}</p>
                  <Badge variant={statusColors[status]} size="sm">
                    {status.replace("_", " ")}
                  </Badge>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Latest and Next Release */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {releaseStats.latestRelease && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <h4 className="font-semibold text-neutral-900">Latest Release</h4>
            </div>
            <p className="text-lg font-bold text-neutral-900">
              {releaseStats.latestRelease.version}
            </p>
            <p className="text-sm text-neutral-600">
              {releaseStats.latestRelease.description || "No description"}
            </p>
            <div className="flex items-center space-x-2 mt-2 text-sm text-neutral-500">
              <Calendar className="w-4 h-4" />
              <span>
                {releaseStats.latestRelease.release_date
                  ? new Date(
                      releaseStats.latestRelease.release_date
                    ).toLocaleDateString()
                  : "Date not set"}
              </span>
              <Badge variant="success" size="sm">
                Released
              </Badge>
            </div>
          </div>
        )}

        {releaseStats.nextRelease && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-warning" />
              <h4 className="font-semibold text-neutral-900">Next Release</h4>
            </div>
            <p className="text-lg font-bold text-neutral-900">
              {releaseStats.nextRelease.version}
            </p>
            <p className="text-sm text-neutral-600">
              {releaseStats.nextRelease.description || "No description"}
            </p>
            <div className="flex items-center space-x-2 mt-2 text-sm text-neutral-500">
              <Calendar className="w-4 h-4" />
              <span>
                {releaseStats.nextRelease.release_date
                  ? new Date(
                      releaseStats.nextRelease.release_date
                    ).toLocaleDateString()
                  : "Date not set"}
              </span>
              <Badge
                variant={
                  releaseStats.nextRelease.status === "released"
                    ? "success"
                    : "warning"
                }
                size="sm"
              >
                {releaseStats.nextRelease.status || "planned"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseStats;
