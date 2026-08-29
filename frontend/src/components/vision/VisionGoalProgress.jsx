// src/components/vision/VisionGoalProgress.jsx
import React, { useEffect } from "react";
import { useVision } from "../../hooks/useVision";
import { LoadingSpinner, Alert, ProgressBar, Badge } from "../common";
import { CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

const VisionGoalProgress = ({ goalId }) => {
  const { getGoalProgress, currentGoal, isLoading, error, clearError } =
    useVision();

  useEffect(() => {
    if (goalId) {
      getGoalProgress(goalId);
    }
  }, [goalId]);

  if (isLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  const progress = currentGoal?.progress || {};

  const {
    progress: progressValue = 0,
    totalProjects = 0,
    completedProjects = 0,
    inProgressProjects = 0,
    notStartedProjects = 0,
    status = "not_started",
    completionRatio = "0/0",
    summary = "",
  } = progress;

  const statusConfigs = {
    not_started: { icon: XCircle, color: "neutral", label: "Not Started" },
    in_progress: { icon: Clock, color: "warning", label: "In Progress" },
    completed: { icon: CheckCircle, color: "success", label: "Completed" },
  };

  const config = statusConfigs[status] || statusConfigs.not_started;
  const Icon = config.icon;

  const stats = [
    { label: "Total Projects", value: totalProjects, color: "info" },
    { label: "Completed", value: completedProjects, color: "success" },
    { label: "In Progress", value: inProgressProjects, color: "warning" },
    { label: "Not Started", value: notStartedProjects, color: "neutral" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge variant={config.color} className="flex items-center space-x-1">
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
          </Badge>
          <span className="text-sm text-neutral-500">
            {completionRatio} projects
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-primary-500" />
          <span className="text-lg font-bold text-primary-500">
            {progressValue}%
          </span>
        </div>
      </div>

      <ProgressBar
        value={progressValue}
        variant={
          progressValue >= 80
            ? "success"
            : progressValue >= 50
            ? "primary"
            : "warning"
        }
        size="lg"
        showLabel
      />

      {summary && (
        <p className="text-sm text-neutral-600 bg-neutral-200 p-3 rounded-lg">
          {summary}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-neutral-200 rounded-lg p-3 text-center"
          >
            <p className="text-xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionGoalProgress;
