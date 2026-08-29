// src/components/projects/FeatureList.jsx
import React, { useState, useEffect } from "react";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  LoadingSpinner,
  Alert,
  EmptyState,
  Badge,
  Modal,
} from "../common";
import FeatureForm from "./FeatureForm";
import SubtaskList from "./SubtaskList";
import {
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";

const FeatureList = ({ projectId }) => {
  const { toast } = useToast();
  const {
    getFeatures,
    features,
    isLoading,
    error,
    clearError,
    deleteFeature,
    isDeletingFeature,
  } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);

  useEffect(() => {
    if (projectId) {
      getFeatures(projectId);
    }
  }, [projectId]);

  const getStatusIcon = (status) => {
    const icons = {
      planned: <Circle className="w-4 h-4 text-neutral-500" />,
      in_progress: <Clock className="w-4 h-4 text-warning" />,
      completed: <CheckCircle className="w-4 h-4 text-success" />,
      blocked: <AlertCircle className="w-4 h-4 text-error" />,
      cancelled: <XCircle className="w-4 h-4 text-neutral-500" />,
    };
    return icons[status] || icons.planned;
  };

  const getStatusColor = (status) => {
    const colors = {
      planned: "neutral",
      in_progress: "warning",
      completed: "success",
      blocked: "error",
      cancelled: "neutral",
    };
    return colors[status] || "neutral";
  };

  const handleCreateSuccess = (feature) => {
    setShowCreateModal(false);
    toast.success(`Feature "${feature.title}" created successfully`);
    getFeatures(projectId);
  };

  const handleDeleteClick = (feature) => {
    setSelectedFeature(feature);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFeature) return;
    try {
      await deleteFeature(selectedFeature.id);
      toast.success(`Feature "${selectedFeature.title}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedFeature(null);
      getFeatures(projectId);
    } catch (error) {
      toast.error(error.message || "Failed to delete feature");
    }
  };

  const toggleExpand = (featureId) => {
    setExpandedFeature(expandedFeature === featureId ? null : featureId);
  };

  if (isLoading && features.length === 0) {
    return <LoadingSpinner size="md" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Features</h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Feature</span>
        </Button>
      </div>

      {features.length === 0 ? (
        <EmptyState
          title="No features yet"
          description="Add features to track project progress"
          className="py-8"
        />
      ) : (
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-200 transition-colors"
                onClick={() => toggleExpand(feature.id)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(feature.status)}
                  <span className="font-medium text-neutral-900">
                    {feature.title}
                  </span>
                  <Badge variant={getStatusColor(feature.status)} size="sm">
                    {feature.status}
                  </Badge>
                  {feature.difficulty && (
                    <Badge variant="info" size="sm">
                      {feature.difficulty}
                    </Badge>
                  )}
                  {feature.estimated_days && (
                    <Badge variant="neutral" size="sm">
                      {feature.estimated_days} days
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(feature);
                    }}
                    className="text-error hover:text-error"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {expandedFeature === feature.id && (
                <div className="p-4 border-t border-neutral-300 bg-neutral-200">
                  {feature.description && (
                    <p className="text-sm text-neutral-700 mb-3">
                      {feature.description}
                    </p>
                  )}
                  <SubtaskList featureId={feature.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Feature"
        size="lg"
      >
        <FeatureForm
          projectId={projectId}
          onSubmit={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Feature"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedFeature?.title}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingFeature}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={isDeletingFeature}
              disabled={isDeletingFeature}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeatureList;
