// src/components/subscriptions/SubscriptionsDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  ProgressBar,
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  RELEASE_STATUSES,
  MILESTONE_STATUSES,
  getStatusBadgeVariant,
  formatDate,
  formatVersion,
} from "./SubscriptionsConstants";

const SubscriptionsDashboard = () => {
  const navigate = useNavigate();
  const {
    releases,
    milestones,
    releaseStats,
    milestoneStats,
    overdueMilestones,
    loading,
    error,
    releaseCount,
    milestoneCount,
    completedReleases,
    completedMilestones,
    inProgressReleases,
    inProgressMilestones,
    navigateToReleases,
    navigateToMilestones,
    navigateToNewRelease,
    navigateToNewMilestone,
  } = useSubscriptions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading data">
          {error}
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status, type = "release") => {
    const statuses = type === "release" ? RELEASE_STATUSES : MILESTONE_STATUSES;
    const found = statuses.find((s) => s.value === status);
    return found?.color || "#737373";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Release & Milestone Management</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Track releases, milestones, and project progress
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={navigateToReleases}>
            <IconWrapper icon="📦" size="sm" />
            View Releases
          </Button>
          <Button variant="outline" onClick={navigateToMilestones}>
            <IconWrapper icon="🎯" size="sm" />
            View Milestones
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{releaseCount}</p>
          <p className="text-sm text-neutral-500">Total Releases</p>
          <div className="mt-1 flex justify-center gap-2 text-xs">
            <span className="text-success">{completedReleases} completed</span>
            <span className="text-warning">
              {inProgressReleases} in progress
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-info">{milestoneCount}</p>
          <p className="text-sm text-neutral-500">Total Milestones</p>
          <div className="mt-1 flex justify-center gap-2 text-xs">
            <span className="text-success">
              {completedMilestones} completed
            </span>
            <span className="text-warning">
              {inProgressMilestones} in progress
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-error">
            {overdueMilestones.length}
          </p>
          <p className="text-sm text-neutral-500">Overdue Milestones</p>
          {overdueMilestones.length > 0 && (
            <p className="text-xs text-neutral-400 mt-1">Needs attention</p>
          )}
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold">
            {releaseCount > 0
              ? Math.round((completedReleases / releaseCount) * 100)
              : 0}
            %
          </p>
          <p className="text-sm text-neutral-500">Release Completion</p>
          <ProgressBar
            value={completedReleases}
            max={releaseCount || 1}
            variant="success"
            size="sm"
            className="mt-2"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={navigateToNewRelease}>
          <IconWrapper icon="➕" size="sm" />
          New Release
        </Button>
        <Button variant="secondary" onClick={navigateToNewMilestone}>
          <IconWrapper icon="➕" size="sm" />
          New Milestone
        </Button>
      </div>

      {/* Recent Releases */}
      {releases.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Releases</h2>
            <Button variant="ghost" size="sm" onClick={navigateToReleases}>
              View All
            </Button>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {releases.slice(0, 5).map((release) => (
              <div
                key={release.id}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                onClick={() =>
                  navigate(`/subscriptions/releases/${release.id}`)
                }
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatVersion(release.version)}
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(release.status)}
                        size="sm"
                      >
                        {release.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-500 truncate max-w-md mt-1">
                      {release.description || "No description"}
                    </p>
                  </div>
                  <div className="text-sm text-neutral-500">
                    {release.release_date && formatDate(release.release_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Milestones */}
      {overdueMilestones.length > 0 && (
        <div className="bg-error/5 dark:bg-error/10 rounded-xl border border-error/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h3 className="font-semibold text-error">Overdue Milestones</h3>
            <Badge variant="error" size="sm">
              {overdueMilestones.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {overdueMilestones.slice(0, 3).map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() =>
                  navigate(`/subscriptions/milestones/${milestone.id}`)
                }
              >
                <div>
                  <p className="font-medium">{milestone.name}</p>
                  <p className="text-sm text-neutral-500">
                    Target: {formatDate(milestone.target_date)}
                  </p>
                </div>
                <Badge variant="error" size="sm">
                  Overdue
                </Badge>
              </div>
            ))}
            {overdueMilestones.length > 3 && (
              <Button variant="ghost" size="sm" onClick={navigateToMilestones}>
                View all {overdueMilestones.length} overdue milestones
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      {releaseStats && milestoneStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 className="font-semibold mb-3">Release Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Total Releases</span>
                <span className="font-medium">{releaseStats.total || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Released</span>
                <span className="font-medium text-success">
                  {releaseStats.released || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">In Progress</span>
                <span className="font-medium text-warning">
                  {releaseStats.in_progress || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Cancelled</span>
                <span className="font-medium text-error">
                  {releaseStats.cancelled || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <h3 className="font-semibold mb-3">Milestone Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Total Milestones</span>
                <span className="font-medium">{milestoneStats.total || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Completed</span>
                <span className="font-medium text-success">
                  {milestoneStats.completed || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">In Progress</span>
                <span className="font-medium text-warning">
                  {milestoneStats.in_progress || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Delayed</span>
                <span className="font-medium text-error">
                  {milestoneStats.delayed || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsDashboard;
