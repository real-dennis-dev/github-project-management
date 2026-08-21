// src/components/project-management/ProjectBoard.jsx

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
  Dropdown,
  DropdownItem,
} from "../common";
import useProjects from "./useProjects";
import {
  FEATURE_STATUSES,
  getFeatureStatus,
  getFeatureDifficulty,
} from "./ProjectConstants";

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    features,
    loading,
    error,
    fetchFeatures,
    updateFeature,
    deleteFeature,
    navigateToEdit,
    navigateToProject,
  } = useProjects();

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draggingFeature, setDraggingFeature] = useState(null);

  // Group features by status
  const groupedFeatures = features.reduce((acc, feature) => {
    const status = feature.status || "planned";
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(feature);
    return acc;
  }, {});

  // Get features for a specific status
  const getFeaturesByStatus = (status) => {
    return groupedFeatures[status] || [];
  };

  // Handle drag start
  const handleDragStart = (feature) => {
    setDraggingFeature(feature);
  };

  // Handle drop
  const handleDrop = async (status) => {
    if (!draggingFeature) return;

    try {
      await updateFeature(draggingFeature.id, {
        ...draggingFeature,
        status,
      });
      await fetchFeatures();
    } catch (err) {
      // Error handled by hook
    } finally {
      setDraggingFeature(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedFeature) {
      try {
        await deleteFeature(selectedFeature.id);
        setShowDeleteModal(false);
        setSelectedFeature(null);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Projects", href: "/projects" },
    { label: project?.name || "Project", href: `/projects/${projectId}` },
    { label: "Board", href: "" },
  ];

  if (loading && !features.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading board">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Board</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {features.length} features across {FEATURE_STATUSES.length} stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigateToProject(projectId)}
          >
            <IconWrapper icon="📋" size="sm" />
            Project Details
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/projects/${projectId}/features/new`)}
          >
            <IconWrapper icon="➕" size="sm" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {FEATURE_STATUSES.map((status) => (
          <div
            key={status.value}
            className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status.value)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>{status.icon}</span>
                <h3 className="font-semibold">{status.label}</h3>
                <Badge variant="neutral" size="sm">
                  {getFeaturesByStatus(status.value).length}
                </Badge>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {getFeaturesByStatus(status.value).map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(feature)}
                >
                  {/* Feature Content */}
                  <div className="space-y-2">
                    <h4 className="font-medium">{feature.title}</h4>
                    {feature.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {feature.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor:
                            getFeatureDifficulty(feature.difficulty).color +
                            "20",
                          color: getFeatureDifficulty(feature.difficulty).color,
                        }}
                        size="sm"
                      >
                        {getFeatureDifficulty(feature.difficulty).icon}{" "}
                        {getFeatureDifficulty(feature.difficulty).label}
                      </Badge>
                      {feature.estimated_days && (
                        <Badge variant="neutral" size="sm">
                          📅 {feature.estimated_days}d
                        </Badge>
                      )}
                    </div>
                    {/* Actions */}
                    <div
                      className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/features/${feature.id}/edit`)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={() => {
                          setSelectedFeature(feature);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Feature"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this feature? This action cannot be
            undone.
          </p>
          {selectedFeature && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedFeature.title}</p>
              <p className="text-sm text-neutral-500">
                {getFeatureStatus(selectedFeature.status).label} ·{" "}
                {getFeatureDifficulty(selectedFeature.difficulty).label}
              </p>
            </div>
          )}
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

export default ProjectBoard;
