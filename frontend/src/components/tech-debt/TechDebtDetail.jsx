// src/components/tech-debt/TechDebtDetail.jsx

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
} from "../common";
import useTechDebt from "./useTechDebt";
import {
  getPriority,
  getPriorityLabel,
  getPriorityColor,
  getPriorityIcon,
  getStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  STATUSES,
} from "./TechDebtConstants";

const TechDebtDetail = () => {
  const { techDebtId } = useParams();
  const navigate = useNavigate();
  const {
    getItemById,
    deleteItem,
    updateStatus,
    loading: hookLoading,
  } = useTechDebt();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load tech debt data
  useEffect(() => {
    if (techDebtId) {
      loadItem();
    }
  }, [techDebtId]);

  const loadItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItemById(techDebtId);
      if (data) {
        setItem(data);
      } else {
        setError("Tech debt item not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load tech debt item");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteItem(techDebtId);
      navigate("/tech-debt");
    } catch (err) {
      setError(err.message || "Failed to delete tech debt item");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    try {
      await updateStatus(techDebtId, status);
      setShowStatusModal(false);
      await loadItem();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/tech-debt/${techDebtId}/edit`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Tech Debt", href: "/tech-debt" },
    { label: item?.title || "Item Detail", href: "" },
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
        <Alert variant="error" title="Error loading tech debt item">
          {error}
        </Alert>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Item not found">
          The tech debt item you're looking for doesn't exist or has been
          deleted.
        </Alert>
      </div>
    );
  }

  const priority = getPriority(item.priority);
  const status = getStatus(item.status);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              style={{
                backgroundColor: priority.color + "20",
                color: priority.color,
              }}
              className="flex items-center gap-1"
            >
              <span>{priority.icon}</span>
              <span>{priority.label}</span>
            </Badge>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: status.color + "20",
                color: status.color,
              }}
              className="flex items-center gap-1"
            >
              <span>{status.icon}</span>
              <span>{status.label}</span>
            </Badge>
            {item.estimated_effort_hours && (
              <Badge variant="info" className="flex items-center gap-1">
                <span>⏱️</span>
                <span>{item.estimated_effort_hours}h estimated</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowStatusModal(true)}>
            <IconWrapper icon="🔄" size="sm" />
            Change Status
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Description
            </h3>
            <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Reason and Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {item.reason && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Reason
                </h3>
                <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {item.reason}
                </p>
              </div>
            )}
            {item.impact && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Impact
                </h3>
                <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {item.impact}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Created: {formatDate(item.created_at)}</span>
            <span>Updated: {formatDate(item.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tech Debt Item"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this tech debt item? This action
            cannot be undone.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: priority.color + "20",
                  color: priority.color,
                }}
              >
                {priority.label}
              </Badge>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: status.color + "20",
                  color: status.color,
                }}
              >
                {status.label}
              </Badge>
            </div>
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

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a new status for this tech debt item:
          </p>
          <div className="space-y-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  item.status === s.value
                    ? "bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
                onClick={() => handleStatusUpdate(s.value)}
                disabled={updatingStatus}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
                {item.status === s.value && (
                  <span className="ml-auto text-primary-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TechDebtDetail;
