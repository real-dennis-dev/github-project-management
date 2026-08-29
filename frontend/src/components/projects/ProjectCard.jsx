// src/components/projects/ProjectCard.jsx
import React from "react";
import { Badge, ProgressBar } from "../common";
import { Calendar, GitBranch, MoreVertical } from "lucide-react";
import ProjectStatusBadge from "./ProjectStatusBadge";

const ProjectCard = ({ project, onClick, onEdit, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "neutral",
      medium: "info",
      high: "warning",
      critical: "error",
    };
    return colors[priority] || "neutral";
  };

  return (
    <div
      className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 truncate flex-1">
          {project.name}
        </h3>
        <div className="flex items-center space-x-2 ml-2">
          <Badge variant={getPriorityColor(project.priority)} size="sm">
            {project.priority || "Medium"}
          </Badge>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Show dropdown or menu
            }}
            className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
        {project.description || "No description"}
      </p>

      <div className="mt-3 flex items-center space-x-2">
        <ProjectStatusBadge status={project.status} />
        {project.tech_stack && project.tech_stack.length > 0 && (
          <Badge variant="info" size="sm">
            {project.tech_stack.slice(0, 2).join(", ")}
            {project.tech_stack.length > 2 &&
              ` +${project.tech_stack.length - 2}`}
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <ProgressBar
          value={project.completion_percentage || 0}
          max={100}
          size="sm"
          showLabel
          label={`${project.completion_percentage || 0}%`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Start: {formatDate(project.start_date)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>Target: {formatDate(project.target_completion_date)}</span>
        </div>
        {project.repository_url && (
          <div className="flex items-center space-x-1">
            <GitBranch className="w-3 h-3" />
            <span>Repo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
