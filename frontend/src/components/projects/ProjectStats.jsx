// src/components/projects/ProjectStats.jsx
import React from "react";
import { Badge, ProgressBar } from "../common";
import { CheckCircle, AlertCircle, Clock, Calendar } from "lucide-react";

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
      label: "Features",
      value: stats.features || 0,
      icon: CheckCircle,
      color: "primary",
    },
    {
      label: "Bugs",
      value: stats.bugs || 0,
      icon: AlertCircle,
      color: "error",
    },
    {
      label: "In Progress",
      value: stats.in_progress || 0,
      icon: Clock,
      color: "warning",
    },
    {
      label: "Completed",
      value: stats.completed || 0,
      icon: Calendar,
      color: "success",
    },
  ];

  const getStatusColor = (value, total) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center"
            >
              <div className={`text-${card.color}-500 flex justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mt-2">
                {card.value}
              </p>
              <p className="text-sm text-neutral-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {project && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Project Progress
          </h3>
          <ProgressBar
            value={project.completion_percentage || 0}
            max={100}
            size="lg"
            showLabel
            label={`${project.completion_percentage || 0}% Complete`}
          />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Status</span>
              <Badge variant="info" size="sm">
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Priority</span>
              <Badge variant="warning" size="sm">
                {project.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Start Date</span>
              <span className="text-neutral-800">
                {project.start_date
                  ? new Date(project.start_date).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Target</span>
              <span className="text-neutral-800">
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
    </div>
  );
};

export default ProjectStats;
