// src/components/releases-milestone/MilestoneDetail.jsx

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
} from "../common";
import useReleasesMilestone from "./useReleasesMilestone";
import {
  MILESTONE_STATUSES,
  MILESTONE_PRIORITIES,
  getMilestoneStatus,
  getMilestonePriority,
} from "./ReleasesMilestoneConstants";

const MilestoneDetail = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const {
    getMilestoneById,
    deleteMilestone,
    getMilestoneProgress,
    milestonesLoading,
  } = useReleasesMilestone();

  const [milestone, setMilestone] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load milestone data
  useEffect(() => {
    if (milestoneId) {
      loadMilestone();
    }
  }, [milestoneId]);

  const loadMilestone = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMilestoneById(milestoneId);
      if (data) {
        setMilestone(data);
        // Load progress
        const progressData = await getMilestoneProgress(milestoneId);
        if (progressData) {
          setProgress(progressData);
        }
      } else {
        setError("Milestone not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load milestone");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteMilestone(milestoneId);
      navigate("/releases-milestone/milestones");
    } catch (err) {
      setError(err.message || "Failed to delete milestone");
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/releases-milestone/milestones/${milestoneId}/edit`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Milestones", href: "/releases-milestone/milestones" },
    { label: milestone?.name || "Milestone Detail", href: "" },
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
        <Alert variant="error" title="Error loading milestone">
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
  const priorityInfo = getMilestonePriority(milestone.priority || "medium");
  const isOverdue =
    milestone.days_until_target !== undefined &&
    milestone.days_until_target < 0 &&
    milestone.status !== "completed";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{milestone.name}</h1>
            {isOverdue && (
              <Badge variant="error" className="flex items-center gap-1">
                ⚠️ Overdue
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
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
            <Badge
              variant="secondary"
              style={{
                backgroundColor: priorityInfo.color + "20",
                color: priorityInfo.color,
              }}
            >
              {priorityInfo.label} Priority
            </Badge>
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

      {/* Progress Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium">Progress</h2>
          <span className="text-lg font-bold text-primary-500">
            {milestone.progress_percentage}%
          </span>
        </div>
        <ProgressBar
          value={milestone.progress_percentage}
          max={100}
          variant={
            milestone.progress_percentage >= 80
              ? "success"
              : milestone.progress_percentage >= 50
              ? "warning"
              : "primary"
          }
          size="lg"
          className="w-full"
        />
        {progress && (
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
            <span>Status: {statusInfo.label}</span>
            <span>
              {progress.days_until_target !== undefined &&
              progress.days_until_target !== null
                ? progress.days_until_target >= 0
                  ? `${progress.days_until_target} days until target`
                  : `${Math.abs(progress.days_until_target)} days overdue`
                : "-"}
            </span>
          </div>
        )}
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Description */}
          {milestone.description && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Description
              </h3>
              <p className="text-neutral-800 dark:text-neutral-200">
                {milestone.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Target Date
              </p>
              <p className="font-medium">{milestone.target_date || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Completed Date
              </p>
              <p className="font-medium">{milestone.completed_date || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Status
              </p>
              <p className="font-medium flex items-center gap-2">
                <span>{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Priority
              </p>
              <p className="font-medium">{priorityInfo.label}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              Created: {new Date(milestone.created_at).toLocaleString()}
            </span>
            <span>
              Updated: {new Date(milestone.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Milestone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this milestone? This action cannot
            be undone.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{milestone.name}</p>
            <p className="text-sm text-neutral-500">
              Status: {statusInfo.label} · {milestone.progress_percentage}%
              complete
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
    </div>
  );
};

export default MilestoneDetail;
