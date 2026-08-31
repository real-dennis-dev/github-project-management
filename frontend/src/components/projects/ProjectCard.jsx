// src/components/projects/ProjectCard.jsx
import React from "react";
import { Badge, ProgressBar } from "../common";
import { Calendar, GitBranch, MoreVertical, Users, Code2 } from "lucide-react";
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
      className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {project.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
            <ProjectStatusBadge status={project.status} size="sm" />
            <Badge variant={getPriorityColor(project.priority)} size="sm">
              {project.priority || "Medium"}
            </Badge>
            {project.tech_stack && project.tech_stack.length > 0 && (
              <Badge variant="info" size="sm">
                <Code2 className="w-3 h-3 inline mr-1" />
                {project.tech_stack.slice(0, 2).join(", ")}
                {project.tech_stack.length > 2 &&
                  ` +${project.tech_stack.length - 2}`}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1 hover:bg-neutral-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title="Edit project"
          >
            <MoreVertical className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-500 mt-2 line-clamp-2 min-h-[40px]">
        {project.description || "No description"}
      </p>

      <div className="mt-4">
        <ProgressBar
          value={project.completion_percentage || 0}
          max={100}
          size="sm"
          showLabel
          label={`${project.completion_percentage || 0}% Complete`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(project.start_date)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(project.target_completion_date)}</span>
        </div>
        {project.repository_url && (
          <a
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1 text-primary-500 hover:text-primary-600 transition-colors"
          >
            <GitBranch className="w-3 h-3" />
            <span>Repo</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
