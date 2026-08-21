// src/components/vision-board/VisionBoardDetail.jsx

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
  Card,
} from "../common";
import useVisionBoard from "./useVisionBoard";
import {
  getStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  getPriorityLabel,
  getPriorityColor,
} from "./VisionBoardConstants";

const VisionBoardDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const {
    getVisionGoalById,
    deleteVisionGoal,
    fetchGoalProgress,
    fetchAvailableProjects,
    linkProjectToGoal,
    unlinkProjectFromGoal,
    loading: hookLoading,
    availableProjects,
    goalProgress,
  } = useVisionBoard();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [linking, setLinking] = useState(false);

  // Load goal data
  useEffect(() => {
    if (goalId) {
      loadGoal();
    }
  }, [goalId]);

  const loadGoal = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVisionGoalById(goalId);
      if (data) {
        setGoal(data);
        await fetchGoalProgress(goalId);
        await fetchAvailableProjects(goalId);
      } else {
        setError("Vision goal not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load vision goal");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteVisionGoal(goalId);
      navigate("/vision-board");
    } catch (err) {
      setError(err.message || "Failed to delete vision goal");
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/vision-board/${goalId}/edit`);
  };

  // Handle link project
  const handleLinkProject = async () => {
    if (!selectedProject) return;
    setLinking(true);
    try {
      await linkProjectToGoal(goalId, selectedProject);
      setShowLinkModal(false);
      setSelectedProject("");
      await loadGoal();
    } catch (err) {
      setError(err.message || "Failed to link project");
    } finally {
      setLinking(false);
    }
  };

  // Handle unlink project
  const handleUnlinkProject = async (projectId) => {
    try {
      await unlinkProjectFromGoal(goalId, projectId);
      await loadGoal();
    } catch (err) {
      setError(err.message || "Failed to unlink project");
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Vision Board", href: "/vision-board" },
    { label: goal?.goal || "Goal Detail", href: "" },
  ];

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
        <Alert variant="error" title="Error loading vision goal">
          {error}
        </Alert>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Goal not found">
          The vision goal you're looking for doesn't exist or has been deleted.
        </Alert>
      </div>
    );
  }

  const statusInfo = getStatus(goal.status);
  const priorityInfo = getPriorityLabel(goal.priority);
  const priorityColor = getPriorityColor(goal.priority);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{goal.goal}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: statusInfo?.color + "20",
                color: statusInfo?.color,
              }}
              className="flex items-center gap-1"
            >
              <span>{statusInfo?.icon}</span>
              <span>{statusInfo?.label}</span>
            </Badge>
            <Badge
              variant="neutral"
              className="flex items-center gap-1"
              style={{ borderColor: priorityColor, color: priorityColor }}
            >
              ⭐ {priorityInfo}
            </Badge>
            {goal.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                📂 {goal.category}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Goal Details */}
      <div className="space-y-6">
        {/* Description */}
        {goal.description && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Description
            </h2>
            <p className="text-neutral-800 dark:text-neutral-200">
              {goal.description}
            </p>
          </div>
        )}

        {/* Progress Section */}
        {goalProgress && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
              Progress
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">
                    {goalProgress.progress}%
                  </span>
                </div>
                <ProgressBar
                  value={goalProgress.progress}
                  max={100}
                  variant={goalProgress.progress >= 100 ? "success" : "primary"}
                  size="md"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-2xl font-bold">
                    {goalProgress.totalProjects || 0}
                  </p>
                  <p className="text-xs text-neutral-500">Total Projects</p>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">
                    {goalProgress.completedProjects || 0}
                  </p>
                  <p className="text-xs text-neutral-500">Completed</p>
                </div>
                <div className="text-center p-3 bg-info/10 rounded-lg">
                  <p className="text-2xl font-bold text-info">
                    {goalProgress.inProgressProjects || 0}
                  </p>
                  <p className="text-xs text-neutral-500">In Progress</p>
                </div>
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-2xl font-bold">
                    {goalProgress.notStartedProjects || 0}
                  </p>
                  <p className="text-xs text-neutral-500">Not Started</p>
                </div>
              </div>
              {goalProgress.summary && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  {goalProgress.summary}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Linked Projects */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Linked Projects
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLinkModal(true)}
              disabled={availableProjects.length === 0}
            >
              <IconWrapper icon="🔗" size="sm" />
              Link Project
            </Button>
          </div>
          {goal.linked_projects && goal.linked_projects.length > 0 ? (
            <div className="space-y-2">
              {goal.linked_projects.map((link) => (
                <div
                  key={link.project_id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{link.project_name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {link.project_description || "No description"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => handleUnlinkProject(link.project_id)}
                  >
                    🔗 Unlink
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No projects linked to this goal yet.
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Created: {new Date(goal.created_at).toLocaleString()}</span>
          <span>Updated: {new Date(goal.updated_at).toLocaleString()}</span>
          {goal.target_timeline && <span>Target: {goal.target_timeline}</span>}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Vision Goal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this vision goal? This action cannot
            be undone.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{goal.goal}</p>
            <p className="text-sm text-neutral-500">
              {statusInfo?.label} · {priorityInfo}
            </p>
          </div>
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

      {/* Link Project Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSelectedProject("");
        }}
        title="Link Project to Goal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a project to link to "{goal.goal}"
          </p>
          {availableProjects.length > 0 ? (
            <>
              <select
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select a project...</option>
                {availableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.status})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedProject("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleLinkProject}
                  loading={linking}
                  disabled={!selectedProject || linking}
                >
                  Link Project
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-neutral-500">No available projects to link.</p>
              <p className="text-sm text-neutral-400 mt-1">
                All projects are already linked or you don't have any projects.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VisionBoardDetail;
