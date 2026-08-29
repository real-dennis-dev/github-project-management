// src/components/techdebt/TechDebtDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTechDebt } from "../../hooks/useTechDebt";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Button, Badge, Modal } from "../common";
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import TechDebtStatusBadge from "./TechDebtStatusBadge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const TechDebtDetail = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const {
    getItem,
    getItems,
    updateStatus,
    deleteItem,
    currentItem,
    isLoading,
    error,
    clearError,
  } = useTechDebt();
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      getItem(id);
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const result = await updateStatus(id, { status: newStatus });
      if (result.success) {
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
        getItem(id);
        getItems(projectId);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteItem(id);
      if (result.success) {
        toast.success("Tech debt item deleted successfully");
        navigate(`/tech-debt/${projectId}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete tech debt item");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentItem) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">Tech debt item not found</p>
        <Link to={`/tech-debt/${projectId}`}>
          <Button variant="primary" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    reason,
    impact,
    priority,
    status,
    estimated_effort_hours,
    created_at,
    updated_at,
  } = currentItem;

  const statusOptions = [
    "identified",
    "planned",
    "in_progress",
    "resolved",
    "ignored",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to={`/tech-debt/${projectId}`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <TechDebtPriorityBadge priority={priority} />
              <TechDebtStatusBadge status={status} />
              {estimated_effort_hours > 0 && (
                <Badge
                  variant="neutral"
                  className="flex items-center space-x-1"
                >
                  <Clock className="w-3 h-3" />
                  <span>{estimated_effort_hours} hours estimated</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/tech-debt/${projectId}/${id}/edit`}>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            className="flex items-center space-x-1"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-neutral-700">
            Update Status:
          </span>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <Button
                key={s}
                variant={s === status ? "primary" : "outline"}
                size="sm"
                onClick={() => handleStatusChange(s)}
                disabled={s === status}
              >
                {s === status && <CheckCircle className="w-3 h-3 mr-1" />}
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Description
            </h3>
            <p className="text-neutral-800 whitespace-pre-wrap">
              {description}
            </p>
          </div>

          {/* Reason */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reason
            </h3>
            <p className="text-neutral-800 whitespace-pre-wrap">
              {reason || "No reason provided"}
            </p>
          </div>

          {/* Impact */}
          {impact && (
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Impact
              </h3>
              <p className="text-neutral-800 whitespace-pre-wrap">{impact}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-4">
              Details
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-neutral-500">Created</dt>
                <dd className="text-sm text-neutral-800 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(created_at)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Last Updated</dt>
                <dd className="text-sm text-neutral-800 flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>{formatDate(updated_at)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Priority</dt>
                <dd>
                  <TechDebtPriorityBadge priority={priority} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Status</dt>
                <dd>
                  <TechDebtStatusBadge status={status} />
                </dd>
              </div>
              {estimated_effort_hours > 0 && (
                <div>
                  <dt className="text-xs text-neutral-500">Estimated Effort</dt>
                  <dd className="text-sm text-neutral-800">
                    {estimated_effort_hours} hours
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tech Debt Item"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete this tech debt item? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TechDebtDetail;
