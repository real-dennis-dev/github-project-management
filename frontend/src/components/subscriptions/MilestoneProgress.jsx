// src/components/subscriptions/MilestoneProgress.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Breadcrumb,
  ProgressBar,
  Input,
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  MILESTONE_STATUSES,
  getMilestoneStatus,
  getStatusBadgeVariant,
  formatDate,
} from "./SubscriptionsConstants";

const MilestoneProgress = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const {
    milestone,
    milestoneProgress,
    loading,
    error,
    updateMilestone,
    navigateToMilestone,
  } = useSubscriptions();

  const [progress, setProgress] = useState(milestone?.progress_percentage || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Milestones", href: "/subscriptions/milestones" },
    {
      label: milestone?.name || "Milestone",
      href: `/subscriptions/milestones/${milestoneId}`,
    },
    { label: "Progress", href: "" },
  ];

  // Handle progress update
  const handleProgressUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateMilestone(milestoneId, { progress_percentage: progress });
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !milestone) {
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

  if (!milestone) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Milestone not found">
          The milestone you're looking for doesn't exist or has been deleted.
        </Alert>
      </div>
    );
  }

  const statusInfo = getMilestoneStatus(milestone.status);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Milestone Progress: {milestone.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={getStatusBadgeVariant(milestone.status, "milestone")}
              size="sm"
            >
              {statusInfo.icon} {statusInfo.label}
            </Badge>
            <span className="text-sm text-neutral-500">
              Target:{" "}
              {milestone.target_date ? formatDate(milestone.target_date) : "-"}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigateToMilestone(milestoneId)}
        >
          <IconWrapper icon="←" size="sm" />
          Back to Milestone
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <span className="text-2xl font-bold text-primary-500">
            {milestone.progress_percentage || 0}%
          </span>
        </div>
        <ProgressBar
          value={milestone.progress_percentage || 0}
          max={100}
          variant={
            milestone.progress_percentage === 100
              ? "success"
              : milestone.progress_percentage >= 50
              ? "primary"
              : "neutral"
          }
          size="lg"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-success">
              {milestoneProgress?.completed || 0}
            </p>
            <p className="text-xs text-neutral-500">Completed</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-warning">
              {milestoneProgress?.in_progress || 0}
            </p>
            <p className="text-xs text-neutral-500">In Progress</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-info">
              {milestoneProgress?.pending || 0}
            </p>
            <p className="text-xs text-neutral-500">Pending</p>
          </div>
          <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold">
              {milestoneProgress?.total || 0}
            </p>
            <p className="text-xs text-neutral-500">Total Tasks</p>
          </div>
        </div>
      </div>

      {/* Update Progress */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Update Progress</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Progress: {progress}%
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-sm font-medium min-w-[3rem] text-center">
                {progress}%
              </span>
            </div>
            <ProgressBar
              value={progress}
              max={100}
              variant={
                progress === 100
                  ? "success"
                  : progress >= 50
                  ? "primary"
                  : "neutral"
              }
              size="sm"
              className="mt-2"
              showLabel
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleProgressUpdate}
              loading={isUpdating}
              disabled={
                isUpdating || progress === milestone.progress_percentage
              }
            >
              Update Progress
            </Button>
            {progress !== milestone.progress_percentage && (
              <Button
                variant="ghost"
                onClick={() => setProgress(milestone.progress_percentage || 0)}
              >
                Reset
              </Button>
            )}
          </div>
          {milestone.status === "completed" && (
            <Alert variant="success" title="Milestone Completed">
              This milestone has been marked as completed. Progress is at 100%.
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgress;
