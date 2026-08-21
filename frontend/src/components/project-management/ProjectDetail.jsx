// src/components/project-management/ProjectDetail.jsx (Updated with SubtaskList integration)

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Modal,
  Breadcrumb,
  ProgressBar,
  Tabs,
  Tab,
} from "../common";
import useProjects from "./useProjects";
import SubtaskList from "./SubtaskList";
import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  getProjectStatus,
  getProjectPriority,
  FEATURE_STATUSES,
  BUG_STATUSES,
} from "./ProjectConstants";
import { useAuth } from "../../context/AuthContext";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    project,
    features,
    bugs,
    statistics,
    loading,
    error,
    deleteProject,
    navigateToEdit,
    navigateToBoard,
    navigateToDashboard,
  } = useProjects();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteProject();
    } catch (err) {
      // Error handled by hook
    }
  };

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
        className="flex items-center gap-1 text-sm"
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
        className="flex items-center gap-1"
      >
        <span>{priorityInfo.icon}</span>
        <span>{priorityInfo.label}</span>
      </Badge>
    );
  };

  // Render feature status badge
  const renderFeatureStatus = (status) => {
    const statusInfo = FEATURE_STATUSES.find((s) => s.value === status);
    if (!statusInfo) return null;
    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: statusInfo.color + "20",
          color: statusInfo.color,
        }}
        size="sm"
      >
        {statusInfo.icon} {statusInfo.label}
      </Badge>
    );
  };

  // Render bug status badge
  const renderBugStatus = (status) => {
    const statusInfo = BUG_STATUSES.find((s) => s.value === status);
    if (!statusInfo) return null;
    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: statusInfo.color + "20",
          color: statusInfo.color,
        }}
        size="sm"
      >
        {statusInfo.icon} {statusInfo.label}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Projects", href: "/projects" },
    { label: project?.name || "Project Detail", href: "" },
  ];

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading project">
          {error}
        </Alert>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Project not found">
          The project you're looking for doesn't exist or has been deleted.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {renderPriorityBadge(project.priority)}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {renderStatusBadge(project.status)}
            {project.completion_percentage !== undefined && (
              <Badge variant="info" className="flex items-center gap-1">
                <span>📊</span>
                <span>{project.completion_percentage}% complete</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigateToDashboard(projectId)}
          >
            <IconWrapper icon="📊" size="sm" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigateToBoard(projectId)}>
            <IconWrapper icon="📋" size="sm" />
            Board
          </Button>
          <Button variant="outline" onClick={() => navigateToEdit(projectId)}>
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <p className="text-neutral-600 dark:text-neutral-300">
            {project.description}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">
            {statistics?.featureCount || 0}
          </p>
          <p className="text-sm text-neutral-500">Features</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-error">
            {statistics?.bugCount || 0}
          </p>
          <p className="text-sm text-neutral-500">Bugs</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {statistics?.completedFeatures || 0}
          </p>
          <p className="text-sm text-neutral-500">Completed</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <p className="text-2xl font-bold text-info">
            {statistics?.inProgressFeatures || 0}
          </p>
          <p className="text-sm text-neutral-500">In Progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "features"
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              onClick={() => setActiveTab("features")}
            >
              Features ({features.length})
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "bugs"
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              onClick={() => setActiveTab("bugs")}
            >
              Bugs ({bugs.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium text-primary-500">
                    {project.completion_percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={project.completion_percentage}
                  max={100}
                  variant="primary"
                  size="lg"
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Start Date
                  </p>
                  <p className="font-medium">
                    {formatDate(project.start_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Target Completion
                  </p>
                  <p className="font-medium">
                    {formatDate(project.target_completion_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Repository
                  </p>
                  {project.repository_url ? (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline font-medium"
                    >
                      View Repository 🔗
                    </a>
                  ) : (
                    <p className="text-neutral-400">No repository linked</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Created By
                  </p>
                  <p className="font-medium">{user?.name || "Unknown"}</p>
                </div>
              </div>

              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <Badge key={tech} variant="neutral">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span>
                  Created: {new Date(project.created_at).toLocaleString()}
                </span>
                <span>
                  Updated: {new Date(project.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">All Features</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    navigate(`/projects/${projectId}/features/new`)
                  }
                >
                  <IconWrapper icon="➕" size="sm" />
                  Add Feature
                </Button>
              </div>

              {features.length > 0 ? (
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">{feature.title}</h4>
                            {renderFeatureStatus(feature.status)}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                              {feature.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500">
                            <span>
                              Difficulty: {feature.difficulty || "Not set"}
                            </span>
                            {feature.estimated_days && (
                              <span>📅 {feature.estimated_days} days</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/features/${feature.id}/edit`)
                            }
                          >
                            ✏️
                          </Button>
                        </div>
                      </div>

                      {/* Subtasks */}
                      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <SubtaskList featureId={feature.id} feature={feature} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-400">No features yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      navigate(`/projects/${projectId}/features/new`)
                    }
                  >
                    Create your first feature
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "bugs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">All Bugs</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/projects/${projectId}/bugs/new`)}
                >
                  <IconWrapper icon="➕" size="sm" />
                  Report Bug
                </Button>
              </div>

              {bugs.length > 0 ? (
                <div className="space-y-4">
                  {bugs.map((bug) => (
                    <div
                      key={bug.id}
                      className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">{bug.title}</h4>
                            {renderBugStatus(bug.status)}
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor:
                                  getBugPriority(bug.priority).color + "20",
                                color: getBugPriority(bug.priority).color,
                              }}
                              size="sm"
                            >
                              {getBugPriority(bug.priority).icon}{" "}
                              {getBugPriority(bug.priority).label}
                            </Badge>
                          </div>
                          {bug.description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                              {bug.description}
                            </p>
                          )}
                          {bug.assigned_to && (
                            <p className="text-sm text-neutral-500 mt-2">
                              Assigned to: {bug.assigned_to}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/bugs/${bug.id}/edit`)}
                          >
                            ✏️
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-400">No bugs reported</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate(`/projects/${projectId}/bugs/new`)}
                  >
                    Report a bug
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
            undone. All features, bugs, and related data will be permanently
            deleted.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{project.name}</p>
            <p className="text-sm text-neutral-500">
              {getProjectStatus(project.status).label} ·{" "}
              {getProjectPriority(project.priority).label}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
