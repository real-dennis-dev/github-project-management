// src/components/releases/MilestoneDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useReleases } from "../../hooks/useReleases";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  ProgressBar,
  Modal,
} from "../common";
import {
  Flag,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";

const MilestoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getMilestone,
    getMilestoneProgress,
    currentMilestone,
    milestoneProgress,
    isLoading,
    error,
    clearError,
    deleteMilestone,
    isDeletingMilestone,
    isMilestoneLoading,
    isMilestoneProgressLoading,
  } = useReleases();

  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      getMilestone(id);
      getMilestoneProgress(id);
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const result = await deleteMilestone(id);
      if (result.success) {
        toast.success("Milestone deleted successfully");
        navigate(-1);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete milestone");
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      not_started: "secondary",
      in_progress: "warning",
      completed: "success",
      delayed: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: Clock,
      in_progress: TrendingUp,
      completed: CheckCircle,
      delayed: AlertTriangle,
    };
    return icons[status] || Flag;
  };

  const isOverdue = () => {
    if (!currentMilestone) return false;
    if (currentMilestone.status === "completed") return false;
    if (!currentMilestone.target_date) return false;
    return new Date(currentMilestone.target_date) < new Date();
  };

  if (isMilestoneLoading && !currentMilestone) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentMilestone) {
    return (
      <Alert variant="info">
        Milestone not found. It may have been deleted.
      </Alert>
    );
  }

  const StatusIcon = getStatusIcon(currentMilestone.status);
  const overdue = isOverdue();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                {currentMilestone.name}
              </h1>
              <Badge
                variant={getStatusVariant(currentMilestone.status)}
                className="flex items-center space-x-1"
              >
                <StatusIcon className="w-3 h-3" />
                <span className="capitalize">
                  {currentMilestone.status.replace("_", " ")}
                </span>
              </Badge>
              {overdue && (
                <Badge variant="error" className="flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Overdue</span>
                </Badge>
              )}
              <Badge
                variant={
                  currentMilestone.priority === "critical"
                    ? "error"
                    : currentMilestone.priority === "high"
                    ? "warning"
                    : currentMilestone.priority === "medium"
                    ? "info"
                    : "neutral"
                }
              >
                {currentMilestone.priority || "medium"}
              </Badge>
            </div>
            {currentMilestone.description && (
              <p className="text-neutral-500 mt-1">
                {currentMilestone.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/milestones/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={currentMilestone.status === "completed"}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Target Date</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentMilestone.target_date
              ? new Date(currentMilestone.target_date).toLocaleDateString()
              : "Not set"}
          </p>
          {currentMilestone.days_until_target !== undefined && (
            <p className="text-sm text-neutral-500 mt-1">
              {currentMilestone.days_until_target > 0
                ? `${currentMilestone.days_until_target} days remaining`
                : currentMilestone.days_until_target === 0
                ? "Due today"
                : `${Math.abs(
                    currentMilestone.days_until_target
                  )} days overdue`}
            </p>
          )}
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Progress</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentMilestone.progress_percentage || 0}%
          </p>
          <div className="mt-2 w-full h-1.5 bg-neutral-300 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                currentMilestone.progress_percentage >= 80
                  ? "bg-success"
                  : currentMilestone.progress_percentage >= 50
                  ? "bg-primary-500"
                  : "bg-warning"
              }`}
              style={{ width: `${currentMilestone.progress_percentage || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Created</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentMilestone.created_at
              ? new Date(currentMilestone.created_at).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentMilestone.completed_date
              ? new Date(currentMilestone.completed_date).toLocaleDateString()
              : currentMilestone.status === "completed"
              ? "Completed"
              : "Not completed"}
          </p>
        </div>
      </div>

      {/* Milestone Progress Detail */}
      {milestoneProgress && !isMilestoneProgressLoading && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Progress Detail
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Progress</p>
              <p className="text-2xl font-bold text-neutral-900">
                {milestoneProgress.progress_percentage || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Status</p>
              <Badge variant={getStatusVariant(milestoneProgress.status)}>
                {milestoneProgress.status || "Unknown"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Days Until Target</p>
              <p className="text-2xl font-bold text-neutral-900">
                {milestoneProgress.days_until_target || "N/A"}
              </p>
            </div>
          </div>
          {milestoneProgress.formatted && (
            <div className="mt-4 p-3 bg-neutral-200 rounded-lg font-mono text-sm">
              {milestoneProgress.formatted}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Milestone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete this milestone? This action cannot
            be undone. Only non-completed milestones can be deleted.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeletingMilestone}
            >
              Delete Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MilestoneDetail;
