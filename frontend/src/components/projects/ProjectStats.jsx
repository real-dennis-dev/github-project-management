// src/components/projects/ProjectStats.jsx
import React from "react";
import { Badge, ProgressBar } from "../common";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  GitBranch,
  Star,
  Users,
  Code,
} from "lucide-react";

const ProjectStats = ({ stats, project }) => {
  if (!stats) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No statistics available
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Features",
      value: stats.total_features || 0,
      icon: Code,
      color: "primary",
      subtitle: `${stats.completed_features || 0} completed`,
    },
    {
      label: "Bugs",
      value: stats.total_bugs || 0,
      icon: AlertCircle,
      color: "error",
      subtitle: `${stats.open_bugs || 0} open`,
    },
    {
      label: "In Progress",
      value: stats.in_progress || 0,
      icon: Clock,
      color: "warning",
      subtitle: "Active items",
    },
    {
      label: "Completion",
      value: stats.completion_rate || 0,
      icon: Star,
      color: "success",
      subtitle: `${stats.completion_rate || 0}% rate`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors"
            >
              <div className={`text-${card.color}-500 flex justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mt-2">
                {card.value}
              </p>
              <p className="text-sm font-medium text-neutral-700">
                {card.label}
              </p>
              {card.subtitle && (
                <p className="text-xs text-neutral-500 mt-1">{card.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Project Progress */}
      {project && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Project Progress
            </h3>
            <Badge variant="info" size="lg">
              {project.completion_percentage || 0}% Complete
            </Badge>
          </div>

          <ProgressBar
            value={project.completion_percentage || 0}
            max={100}
            size="lg"
            showLabel={false}
          />

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center justify-between text-sm p-2 bg-neutral-200 rounded">
              <span className="text-neutral-500">Status</span>
              <Badge variant="info" size="sm">
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-neutral-200 rounded">
              <span className="text-neutral-500">Priority</span>
              <Badge variant="warning" size="sm">
                {project.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-neutral-200 rounded">
              <span className="text-neutral-500">Start</span>
              <span className="text-neutral-800 text-xs">
                {project.start_date
                  ? new Date(project.start_date).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm p-2 bg-neutral-200 rounded">
              <span className="text-neutral-500">Target</span>
              <span className="text-neutral-800 text-xs">
                {project.target_completion_date
                  ? new Date(
                      project.target_completion_date
                    ).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats.category_stats && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Category Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(stats.category_stats).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 bg-neutral-200 rounded"
              >
                <span className="text-sm text-neutral-600 capitalize">
                  {category}
                </span>
                <Badge variant="primary" size="sm">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStats;
