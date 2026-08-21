// src/components/subscriptions/ReleaseProgress.jsx

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Breadcrumb,
  ProgressBar,
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  formatVersion,
  formatDate,
  getStatusBadgeVariant,
  getReleaseStatus,
} from "./SubscriptionsConstants";

const ReleaseProgress = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { release, releaseProgress, loading, error, navigateToRelease } =
    useSubscriptions();

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Releases", href: "/subscriptions/releases" },
    {
      label: release?.version || "Release",
      href: `/subscriptions/releases/${releaseId}`,
    },
    { label: "Progress", href: "" },
  ];

  if (loading && !releaseProgress) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading progress">
          {error}
        </Alert>
      </div>
    );
  }

  if (!releaseProgress) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="No progress data available">
          Progress data is not available for this release yet.
        </Alert>
      </div>
    );
  }

  const statusInfo = release ? getReleaseStatus(release.status) : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Release Progress: {release ? formatVersion(release.version) : ""}
          </h1>
          {release && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusBadgeVariant(release.status)} size="sm">
                {statusInfo?.icon} {statusInfo?.label}
              </Badge>
              <span className="text-sm text-neutral-500">
                {release.release_date ? formatDate(release.release_date) : ""}
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => navigateToRelease(releaseId)}>
          <IconWrapper icon="←" size="sm" />
          Back to Release
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <span className="text-2xl font-bold text-primary-500">
            {releaseProgress.percentage}%
          </span>
        </div>
        <ProgressBar
          value={releaseProgress.percentage || 0}
          max={100}
          variant="primary"
          size="lg"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-success">
              {releaseProgress.completed || 0}
            </p>
            <p className="text-xs text-neutral-500">Completed</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-warning">
              {releaseProgress.in_progress || 0}
            </p>
            <p className="text-xs text-neutral-500">In Progress</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-info">
              {releaseProgress.pending || 0}
            </p>
            <p className="text-xs text-neutral-500">Pending</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold">{releaseProgress.total || 0}</p>
            <p className="text-xs text-neutral-500">Total Features</p>
          </div>
        </div>
      </div>

      {/* Feature Progress */}
      {releaseProgress.features && releaseProgress.features.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Feature Progress</h2>
          <div className="space-y-3">
            {releaseProgress.features.map((feature) => (
              <div
                key={feature.id}
                className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{feature.name}</span>
                  <Badge
                    variant={
                      feature.status === "completed"
                        ? "success"
                        : feature.status === "in_progress"
                        ? "warning"
                        : "neutral"
                    }
                    size="sm"
                  >
                    {feature.status}
                  </Badge>
                </div>
                <ProgressBar
                  value={feature.progress || 0}
                  max={100}
                  variant={
                    feature.progress === 100
                      ? "success"
                      : feature.progress > 50
                      ? "primary"
                      : "neutral"
                  }
                  size="sm"
                  showLabel
                />
                {feature.assignee && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Assigned to: {feature.assignee}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleaseProgress;
