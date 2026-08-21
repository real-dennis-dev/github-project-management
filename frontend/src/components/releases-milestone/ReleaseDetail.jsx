// src/components/releases-milestone/ReleaseDetail.jsx

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
  RELEASE_STATUSES,
  getReleaseStatus,
  getReadinessLevel,
} from "./ReleasesMilestoneConstants";

const ReleaseDetail = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const {
    getReleaseById,
    deleteRelease,
    getReleaseProgress,
    generateChangelog,
    releasesLoading,
  } = useReleasesMilestone();

  const [release, setRelease] = useState(null);
  const [progress, setProgress] = useState(null);
  const [changelog, setChangelog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);

  // Load release data
  useEffect(() => {
    if (releaseId) {
      loadRelease();
    }
  }, [releaseId]);

  const loadRelease = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReleaseById(releaseId);
      if (data) {
        setRelease(data);
        // Load progress
        const progressData = await getReleaseProgress(releaseId);
        if (progressData) {
          setProgress(progressData);
        }
      } else {
        setError("Release not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load release");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteRelease(releaseId);
      navigate("/releases-milestone/releases");
    } catch (err) {
      setError(err.message || "Failed to delete release");
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/releases-milestone/releases/${releaseId}/edit`);
  };

  // Handle changelog generation
  const handleChangelog = async () => {
    try {
      const data = await generateChangelog(releaseId);
      if (data) {
        setChangelog(data.changelog);
        setShowChangelogModal(true);
      }
    } catch (err) {
      setError(err.message || "Failed to generate changelog");
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Releases", href: "/releases-milestone/releases" },
    {
      label: release?.version ? `v${release.version}` : "Release Detail",
      href: "",
    },
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
        <Alert variant="error" title="Error loading release">
          {error}
        </Alert>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Release not found">
          The release you're looking for doesn't exist or has been deleted.
        </Alert>
      </div>
    );
  }

  const statusInfo = getReleaseStatus(release.status);
  const readiness = progress ? getReadinessLevel(progress.readiness) : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">v{release.version}</h1>
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
          </div>
          {release.description && (
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {release.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleChangelog}>
            📋 Changelog
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Progress Section */}
      {progress && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Release Progress</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {progress.percentage}%
              </span>
              {readiness && (
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: readiness.color + "20",
                    color: readiness.color,
                  }}
                >
                  {readiness.label}
                </Badge>
              )}
            </div>
          </div>
          <ProgressBar
            value={progress.percentage}
            max={100}
            variant={progress.percentage >= 80 ? "success" : "primary"}
            size="lg"
            className="w-full"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
            <span>{progress.completedFeatures} completed</span>
            <span>{progress.totalFeatures} total features</span>
          </div>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Release Date
              </p>
              <p className="font-medium">{release.release_date || "-"}</p>
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
          </div>

          {/* Features */}
          {release.features && release.features.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                Features ({release.features.length})
              </h3>
              <div className="space-y-2">
                {release.features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span>{feature.is_completed ? "✅" : "⏳"}</span>
                      <span className="font-medium">{feature.title}</span>
                    </div>
                    {feature.is_completed && (
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              Created: {new Date(release.created_at).toLocaleString()}
            </span>
            <span>
              Updated: {new Date(release.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Release"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this release? This action cannot be
            undone.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium font-mono">v{release.version}</p>
            <p className="text-sm text-neutral-500">
              {release.description || "No description"}
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

      {/* Changelog Modal */}
      <Modal
        isOpen={showChangelogModal}
        onClose={() => setShowChangelogModal(false)}
        title={`Changelog - v${release.version}`}
        size="lg"
      >
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg max-h-96 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {changelog}
          </pre>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            onClick={() => {
              // Copy to clipboard
              navigator.clipboard.writeText(changelog);
            }}
          >
            📋 Copy
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ReleaseDetail;
