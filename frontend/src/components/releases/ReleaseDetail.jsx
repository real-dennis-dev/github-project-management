// src/components/releases/ReleaseDetail.jsx
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
  Tag,
  Calendar,
  GitBranch,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Copy,
} from "lucide-react";

const ReleaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getRelease,
    getReleaseProgress,
    getReleaseChangelog,
    currentRelease,
    releaseProgress,
    changelog,
    isLoading,
    error,
    clearError,
    deleteRelease,
    isDeletingRelease,
    isReleaseLoading,
    isReleaseProgressLoading,
    isChangelogLoading,
  } = useReleases();

  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      getRelease(id);
      getReleaseProgress(id);
      getReleaseChangelog(id);
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const result = await deleteRelease(id);
      if (result.success) {
        toast.success("Release deleted successfully");
        navigate("/releases");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete release");
    }
  };

  const handleCopyChangelog = () => {
    if (!changelog) return;
    navigator.clipboard.writeText(changelog).then(() => {
      setCopied(true);
      toast.success("Changelog copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusVariant = (status) => {
    const variants = {
      planned: "secondary",
      in_progress: "warning",
      testing: "info",
      released: "success",
      cancelled: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: Clock,
      in_progress: GitBranch,
      testing: AlertTriangle,
      released: CheckCircle,
      cancelled: Trash2,
    };
    return icons[status] || Tag;
  };

  const getReadinessLabel = (readiness) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      ready: "Ready",
    };
    return labels[readiness] || "Unknown";
  };

  if (isReleaseLoading && !currentRelease) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentRelease) {
    return (
      <Alert variant="info">Release not found. It may have been deleted.</Alert>
    );
  }

  const StatusIcon = getStatusIcon(currentRelease.status);
  const progress = releaseProgress || currentRelease.readiness || {};

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
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                Release {currentRelease.version}
              </h1>
              <Badge
                variant={getStatusVariant(currentRelease.status)}
                className="flex items-center space-x-1"
              >
                <StatusIcon className="w-3 h-3" />
                <span className="capitalize">
                  {currentRelease.status.replace("_", " ")}
                </span>
              </Badge>
            </div>
            <p className="text-neutral-500 mt-1">
              {currentRelease.description || "No description provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/releases/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
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
            <span className="text-sm">Release Date</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentRelease.release_date
              ? new Date(currentRelease.release_date).toLocaleDateString()
              : "Not set"}
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <GitBranch className="w-4 h-4" />
            <span className="text-sm">Features</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentRelease.total_features || 0} total
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-neutral-900 font-medium">
            {currentRelease.completed_features || 0} features
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-neutral-500 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Readiness</span>
          </div>
          <Badge
            variant={progress.readiness === "ready" ? "success" : "warning"}
          >
            {getReadinessLabel(progress.readiness)}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      {(isReleaseProgressLoading
        ? false
        : progress.percentage !== undefined) && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Release Progress
          </h3>
          <ProgressBar
            value={progress.percentage || 0}
            max={100}
            showLabel
            variant={
              progress.percentage >= 80
                ? "success"
                : progress.percentage >= 50
                ? "primary"
                : "warning"
            }
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-sm text-neutral-500">Total Features</p>
              <p className="text-lg font-bold text-neutral-900">
                {progress.totalFeatures || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Completed</p>
              <p className="text-lg font-bold text-success">
                {progress.completedFeatures || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Remaining</p>
              <p className="text-lg font-bold text-warning">
                {(progress.totalFeatures || 0) -
                  (progress.completedFeatures || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Status</p>
              <p className="text-lg font-bold text-neutral-900">
                {progress.status || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features List */}
      {currentRelease.features && currentRelease.features.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Features
          </h3>
          <div className="space-y-2">
            {currentRelease.features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {feature.title}
                  </p>
                  {feature.description && (
                    <p className="text-sm text-neutral-600">
                      {feature.description}
                    </p>
                  )}
                </div>
                <Badge variant={feature.is_completed ? "success" : "warning"}>
                  {feature.is_completed ? "Completed" : "In Progress"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changelog */}
      {changelog && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Changelog
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyChangelog}
              className="flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
          <div className="bg-neutral-200 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm text-neutral-800 whitespace-pre-wrap">
              {changelog}
            </pre>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Release"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete this release? This action cannot be
            undone. Only releases with no assigned features can be deleted.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeletingRelease}
            >
              Delete Release
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReleaseDetail;
