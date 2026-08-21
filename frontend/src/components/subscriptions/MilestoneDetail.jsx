// src/components/subscriptions/MilestoneDetail.jsx

import React, { useState } from "react";
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
import useSubscriptions from "./useSubscriptions";
import {
  MILESTONE_STATUSES,
  getMilestoneStatus,
  getStatusBadgeVariant,
  formatDate,
  formatDateTime,
} from "./SubscriptionsConstants";

const MilestoneDetail = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const {
    milestone,
    milestoneProgress,
    loading,
    error,
    deleteMilestone,
    updateMilestoneStatus,
    navigateToMilestoneEdit,
    navigateToMilestoneProgress,
    navigateToMilestones,
  } = useSubscriptions();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Milestones", href: "/subscriptions/milestones" },
    { label: milestone?.name || "Milestone", href: "" },
  ];

  // Handle status change
  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    try {
      await updateMilestoneStatus(milestoneId, status);
      setShowStatusModal(false);
    } catch (err) {
      // Error handled by hook
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteMilestone(milestoneId);
      navigate("/subscriptions/milestones");
    } catch (err) {
      // Error handled by hook
    }
  };

  // Check if milestone is overdue
  const isOverdue = () => {
    if (!milestone) return false;
    if (milestone.status === "completed") return false;
    if (!milestone.target_date) return false;
    return new Date(milestone.target_date) < new Date();
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
  const overdue = isOverdue();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{milestone.name}</h1>
            <Badge
              variant={getStatusBadgeVariant(milestone.status, "milestone")}
              size="lg"
            >
              <span className="flex items-center gap-1">
                <span>{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
              </span>
            </Badge>
            {overdue && (
              <Badge variant="error" size="lg">
                ⚠️ Overdue
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Created {formatDateTime(milestone.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowStatusModal(true)}>
            <IconWrapper icon="🔄" size="sm" />
            Change Status
          </Button>
          <Button variant="outline" onClick={navigateToMilestoneEdit}>
            <IconWrapper icon="✏️" size="sm" />
            Edit
          </Button>
          <Button variant="outline" onClick={navigateToMilestoneProgress}>
            <IconWrapper icon="📊" size="sm" />
            Progress
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
        <h2 className="text-sm font-medium text-neutral-500 mb-2">
          Description
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300">
          {milestone.description || "No description provided."}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">
            Milestone Details
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Name</dt>
              <dd className="font-medium">{milestone.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Status</dt>
              <dd>
                <Badge
                  variant={getStatusBadgeVariant(milestone.status, "milestone")}
                  size="sm"
                >
                  {statusInfo.icon} {statusInfo.label}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Target Date</dt>
              <dd className={overdue ? "text-error font-medium" : ""}>
                {milestone.target_date
                  ? formatDate(milestone.target_date)
                  : "-"}
                {overdue && " (Overdue)"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Completed Date</dt>
              <dd>
                {milestone.completed_date
                  ? formatDate(milestone.completed_date)
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">
            Progress
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Completion</span>
                <span className="font-medium">
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
                size="md"
              />
            </div>
            {milestoneProgress && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                  <p className="font-medium">
                    {milestoneProgress.completed || 0}
                  </p>
                  <p className="text-xs text-neutral-500">Completed</p>
                </div>
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                  <p className="font-medium">{milestoneProgress.total || 0}</p>
                  <p className="text-xs text-neutral-500">Total Tasks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Milestone Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a new status for {milestone.name}:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MILESTONE_STATUSES.map((status) => (
              <button
                key={status.value}
                className={`p-3 rounded-lg border-2 text-sm transition-all ${
                  milestone.status === status.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
                onClick={() => handleStatusChange(status.value)}
                disabled={updatingStatus}
              >
                <span className="text-lg block">{status.icon}</span>
                <span>{status.label}</span>
              </button>
            ))}
          </div>
          {updatingStatus && (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm">Updating status...</span>
            </div>
          )}
        </div>
      </Modal>

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
            <p className="text-sm text-neutral-500">{milestone.description}</p>
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
