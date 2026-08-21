// src/components/releases-milestone/ReleasesDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  IconWrapper,
  ProgressBar,
} from "../common";
import useReleasesMilestone from "./useReleasesMilestone";
import {
  RELEASE_STATUSES,
  MILESTONE_STATUSES,
  getReleaseStatus,
  getMilestoneStatus,
} from "./ReleasesMilestoneConstants";

const ReleasesDashboard = () => {
  const navigate = useNavigate();
  const {
    releases,
    releasesLoading,
    releaseStatistics,
    milestones,
    milestonesLoading,
    milestoneStatistics,
    overdueMilestones,
    projectId,
    navigateToNewRelease,
    navigateToNewMilestone,
    navigateToReleaseDetail,
    navigateToMilestoneDetail,
  } = useReleasesMilestone();

  const loading = releasesLoading || milestonesLoading;

  if (loading && !releases.length && !milestones.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Releases & Milestones</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Track your project releases and milestones progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/releases-milestone/releases")}
          >
            <IconWrapper icon="📦" size="sm" />
            View Releases
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/releases-milestone/milestones")}
          >
            <IconWrapper icon="🏁" size="sm" />
            View Milestones
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Total Releases
          </p>
          <p className="text-2xl font-bold text-primary-500">
            {releaseStatistics?.total || 0}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {releaseStatistics?.byStatus &&
              Object.entries(releaseStatistics.byStatus).map(
                ([status, count]) => {
                  const statusInfo = getReleaseStatus(status);
                  if (count === 0) return null;
                  return (
                    <Badge
                      key={status}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      {statusInfo.icon} {count}
                    </Badge>
                  );
                }
              )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Total Milestones
          </p>
          <p className="text-2xl font-bold text-primary-500">
            {milestoneStatistics?.total || 0}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {milestoneStatistics?.byStatus &&
              Object.entries(milestoneStatistics.byStatus).map(
                ([status, count]) => {
                  const statusInfo = getMilestoneStatus(status);
                  if (count === 0) return null;
                  return (
                    <Badge
                      key={status}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      {statusInfo.icon} {count}
                    </Badge>
                  );
                }
              )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Completion Rate
          </p>
          <p className="text-2xl font-bold text-success">
            {milestoneStatistics?.completionRate || 0}%
          </p>
          <p className="text-xs text-neutral-500">
            {milestoneStatistics?.completedCount || 0} completed of{" "}
            {milestoneStatistics?.total || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Overdue
          </p>
          <p className="text-2xl font-bold text-error">
            {milestoneStatistics?.overdueCount || 0}
          </p>
          <p className="text-xs text-neutral-500">
            {overdueMilestones?.length || 0} milestones overdue
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueMilestones && overdueMilestones.length > 0 && (
        <Alert variant="error" title="⚠️ Overdue Milestones">
          <div className="space-y-2">
            <p>You have {overdueMilestones.length} overdue milestone(s):</p>
            <div className="flex flex-wrap gap-2">
              {overdueMilestones.slice(0, 5).map((milestone) => (
                <Button
                  key={milestone.id}
                  variant="ghost"
                  size="sm"
                  className="text-error hover:text-error"
                  onClick={() => navigateToMilestoneDetail(milestone.id)}
                >
                  {milestone.name}
                </Button>
              ))}
              {overdueMilestones.length > 5 && (
                <span className="text-sm text-neutral-500">
                  +{overdueMilestones.length - 5} more
                </span>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Latest Releases</h3>
              <p className="text-sm text-neutral-500">
                Recent releases and their status
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={navigateToNewRelease}>
              <IconWrapper icon="➕" size="sm" />
              New
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {releases.slice(0, 5).map((release) => {
              const statusInfo = getReleaseStatus(release.status);
              return (
                <div
                  key={release.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => navigateToReleaseDetail(release.id)}
                >
                  <div>
                    <p className="font-medium font-mono text-sm">
                      v{release.version}
                    </p>
                    <p className="text-xs text-neutral-500 truncate max-w-xs">
                      {release.description || "No description"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: statusInfo.color + "20",
                      color: statusInfo.color,
                    }}
                    className="flex items-center gap-1"
                  >
                    <span>{statusInfo.icon}</span>
                    <span>{statusInfo.label}</span>
                  </Badge>
                </div>
              );
            })}
            {releases.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">
                No releases yet
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Recent Milestones</h3>
              <p className="text-sm text-neutral-500">
                Latest milestones and progress
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={navigateToNewMilestone}
            >
              <IconWrapper icon="➕" size="sm" />
              New
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {milestones.slice(0, 5).map((milestone) => {
              const statusInfo = getMilestoneStatus(milestone.status);
              return (
                <div
                  key={milestone.id}
                  className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => navigateToMilestoneDetail(milestone.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{milestone.name}</p>
                      <p className="text-xs text-neutral-500">
                        {milestone.days_until_target !== undefined &&
                        milestone.days_until_target !== null
                          ? milestone.days_until_target >= 0
                            ? `${milestone.days_until_target} days left`
                            : `${Math.abs(
                                milestone.days_until_target
                              )} days overdue`
                          : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: statusInfo.color + "20",
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.icon}
                      </Badge>
                      <span className="text-sm font-medium">
                        {milestone.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={milestone.progress_percentage}
                    max={100}
                    variant={
                      milestone.progress_percentage >= 80
                        ? "success"
                        : milestone.progress_percentage >= 50
                        ? "warning"
                        : "primary"
                    }
                    size="sm"
                    className="mt-2"
                  />
                </div>
              );
            })}
            {milestones.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">
                No milestones yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleasesDashboard;
