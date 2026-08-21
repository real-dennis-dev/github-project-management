// src/components/process/TimelineDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Modal,
  ProgressBar,
  Breadcrumb,
} from "../common";
import useProcess from "./useProcess";
import {
  getProgressStatus,
  getStatusClass,
  getStatusIcon,
  getStatusLabel,
} from "./ProcessConstants";

const TimelineDetail = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const {
    getTimelineEntryById,
    deleteTimelineEntry,
    loading: hookLoading,
  } = useProcess();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load entry data
  useEffect(() => {
    if (entryId) {
      loadEntry();
    }
  }, [entryId]);

  const loadEntry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTimelineEntryById(entryId);
      if (data) {
        setEntry(data);
      } else {
        setError("Timeline entry not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load entry");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteTimelineEntry(entryId);
      navigate("/process/timeline");
    } catch (err) {
      setError(err.message || "Failed to delete entry");
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/process/timeline/${entryId}/edit`);
  };

  // Format date
  const formatMonth = (monthYear) => {
    if (!monthYear) return "";
    const date = new Date(monthYear);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Get progress status
  const progressStatus = entry
    ? getProgressStatus(entry.progress_percentage)
    : null;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Process", href: "/process" },
    { label: "Timeline", href: "/process/timeline" },
    { label: entry?.feature_name || "Entry Detail", href: "" },
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
        <Alert variant="error" title="Error loading entry">
          {error}
        </Alert>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Entry not found">
          The timeline entry you're looking for doesn't exist or has been
          deleted.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{entry.feature_name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={progressStatus?.class || "neutral"}
              className="flex items-center gap-1 text-sm"
            >
              <span>{progressStatus?.icon}</span>
              <span>{progressStatus?.label}</span>
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {formatMonth(entry.month_year)}
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

      {/* Details Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Progress
              </span>
              <span className="text-2xl font-bold text-primary-500">
                {entry.progress_percentage}%
              </span>
            </div>
            <ProgressBar
              value={entry.progress_percentage}
              max={100}
              variant={progressStatus?.class || "primary"}
              size="lg"
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Feature
              </p>
              <p className="font-medium">{entry.feature_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Month
              </p>
              <p className="font-medium">{formatMonth(entry.month_year)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Status
              </p>
              <Badge
                variant={progressStatus?.class || "neutral"}
                className="flex items-center gap-1"
              >
                <span>{progressStatus?.icon}</span>
                <span>{progressStatus?.label}</span>
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Progress Level
              </p>
              <p className="font-medium">
                {entry.progress_percentage >= 100
                  ? "✅ Complete"
                  : entry.progress_percentage >= 50
                  ? "🔄 In Progress"
                  : "⏳ Just Started"}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Created: {new Date(entry.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(entry.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Timeline Entry"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this timeline entry? This action
            cannot be undone.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{entry.feature_name}</p>
            <p className="text-sm text-neutral-500">
              {formatMonth(entry.month_year)} · {entry.progress_percentage}%
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

export default TimelineDetail;
