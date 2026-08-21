// src/components/project-management/FeatureForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Alert,
  LoadingSpinner,
  Modal,
  Breadcrumb,
} from "../common";
import useProjects from "./useProjects";
import {
  FEATURE_STATUSES,
  FEATURE_DIFFICULTIES,
  FEATURE_FORM_INITIAL_VALUES,
  getFeatureStatus,
  getFeatureDifficulty,
} from "./ProjectConstants";

const FeatureForm = () => {
  const { projectId, featureId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    features,
    createFeature,
    updateFeature,
    fetchProject,
    loading,
  } = useProjects();

  const [formData, setFormData] = useState(FEATURE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load project and feature data if editing
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    if (featureId) {
      setIsEditing(true);
      loadFeature();
    }
  }, [projectId, featureId]);

  const loadFeature = async () => {
    setIsLoading(true);
    try {
      // Find the feature in the existing features list
      const feature = features.find((f) => f.id === featureId);
      if (feature) {
        setFormData({
          title: feature.title || "",
          description: feature.description || "",
          status: feature.status || "planned",
          difficulty: feature.difficulty || "medium",
          estimated_days: feature.estimated_days || "",
        });
      }
    } catch (err) {
      console.error("Failed to load feature:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Feature title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Feature title must be at least 3 characters";
    }

    if (formData.estimated_days && parseInt(formData.estimated_days) < 0) {
      newErrors.estimated_days = "Estimated days must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const featureData = {
        ...formData,
        estimated_days: formData.estimated_days
          ? parseInt(formData.estimated_days)
          : null,
      };

      let result;
      if (isEditing) {
        result = await updateFeature(featureId, featureData);
        setSuccessMessage("Feature updated successfully!");
      } else {
        result = await createFeature(featureData);
        setSuccessMessage("Feature created successfully!");
      }

      setShowSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/projects/${projectId}/board`);
      }, 2000);
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/projects/${projectId}/board`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Projects", href: "/projects" },
    { label: project?.name || "Project", href: `/projects/${projectId}` },
    { label: "Board", href: `/projects/${projectId}/board` },
    { label: isEditing ? "Edit Feature" : "New Feature", href: "" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Feature" : "Create New Feature"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of your feature"
            : "Add a new feature to your project"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Feature Title <span className="text-error">*</span>
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter feature title..."
            error={errors.title}
            fullWidth
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the feature..."
            rows={3}
            fullWidth
          />
        </div>

        {/* Status and Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {FEATURE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {FEATURE_DIFFICULTIES.map((difficulty) => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.icon} {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated Days */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Estimated Days
          </label>
          <Input
            name="estimated_days"
            type="number"
            min="0"
            value={formData.estimated_days}
            onChange={handleChange}
            placeholder="Number of days..."
            error={errors.estimated_days}
            fullWidth
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Update Feature" : "Create Feature"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {}}
        title="Success"
        size="sm"
        className="text-center"
      >
        <div className="py-4">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-lg font-medium">{successMessage}</p>
          <p className="text-sm text-neutral-500 mt-2">
            Redirecting to board...
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FeatureForm;
