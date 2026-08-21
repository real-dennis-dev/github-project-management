// src/components/project-management/ProjectList.jsx

import React, { useState } from "react";
import {
  Button,
  SearchBar,
  Badge,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Alert,
  IconWrapper,
  Card,
  Dropdown,
  DropdownItem,
  Modal,
} from "../common";
import useProjects from "./useProjects";
import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  getProjectStatus,
  getProjectPriority,
} from "./ProjectConstants";
import { useNavigate } from "react-router-dom";

const ProjectList = () => {
  const navigate = useNavigate();
  const {
    projects,
    loading,
    error,
    pagination,
    filters,
    deleteProject,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    navigateToProject,
    navigateToEdit,
    navigateToNew,
  } = useProjects();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusInfo = getProjectStatus(status);
    return (
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
    );
  };

  // Render priority badge
  const renderPriorityBadge = (priority) => {
    const priorityInfo = getProjectPriority(priority);
    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: priorityInfo.color + "20",
          color: priorityInfo.color,
        }}
        className="flex items-center gap-1 text-xs"
      >
        <span>{priorityInfo.icon}</span>
        <span>{priorityInfo.label}</span>
      </Badge>
    );
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedProject) {
      try {
        await deleteProject(selectedProject.id);
        setShowDeleteModal(false);
        setSelectedProject(null);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Loading state
  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !projects.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading projects">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {pagination.total || 0} projects in total
          </p>
        </div>
        <Button variant="primary" onClick={navigateToNew}>
          <IconWrapper icon="➕" size="sm" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            value={filters.search}
            onChange={(value) => updateFilters({ search: value })}
            placeholder="Search projects..."
            fullWidth
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.priority}
            onChange={(e) => updateFilters({ priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            {PROJECT_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.icon} {priority.label}
              </option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigateToProject(project.id)}
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {renderPriorityBadge(project.priority)}
                  </div>
                </div>

                {/* Status */}
                <div>{renderStatusBadge(project.status)}</div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Progress</span>
                    <span className="font-medium">
                      {project.completion_percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${project.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="neutral" size="sm">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <Badge variant="neutral" size="sm">
                        +{project.tech_stack.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Started: {project.start_date || "N/A"}</span>
                  <span>Target: {project.target_completion_date || "N/A"}</span>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToEdit(project.id)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowDeleteModal(true);
                    }}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects found"
          description="Create your first project to start managing your work."
          action={
            <Button variant="primary" onClick={navigateToNew}>
              <IconWrapper icon="➕" size="sm" />
              New Project
            </Button>
          }
        />
      )}

      {/* Pagination */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {projects.length} of {pagination.total || projects.length}{" "}
            projects
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={
              pagination.totalPages ||
              Math.ceil((pagination.total || 0) / pagination.limit)
            }
            onPageChange={changePage}
            showFirstLast
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
          {selectedProject && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedProject.name}</p>
              <p className="text-sm text-neutral-500">
                {getProjectStatus(selectedProject.status).label} ·{" "}
                {getProjectPriority(selectedProject.priority).label}
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
