// src/components/subscriptions/ReleaseForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Badge,
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  RELEASE_STATUSES,
  RELEASE_FORM_INITIAL_VALUES,
  VERSION_PATTERN,
  getStatusBadgeVariant,
  formatVersion,
} from "./SubscriptionsConstants";

const ReleaseForm = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { createRelease, updateRelease, getReleaseById, loading } =
    useSubscriptions();

  const [formData, setFormData] = useState(RELEASE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load release data if editing
  useEffect(() => {
    if (releaseId) {
      setIsEditing(true);
      loadRelease();
    }
  }, [releaseId]);

  const loadRelease = async () => {
    setIsLoading(true);
    try {
      const release = await getReleaseById(releaseId);
      if (release) {
        setFormData({
          version: release.version || "",
          description: release.description || "",
          status: release.status || "planned",
          features: release.features || [],
          release_date: release.release_date || "",
        });
      }
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate version
    if (!formData.version) {
      newErrors.version = "Version is required";
    } else if (!VERSION_PATTERN.test(formData.version)) {
      newErrors.version = "Version must be in format x.y.z (e.g., 1.0.0)";
    }

    // Validate description
    if (!formData.description) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Validate release date
    if (!formData.release_date) {
      newErrors.release_date = "Release date is required";
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
      if (isEditing) {
        await updateRelease(releaseId, formData);
      } else {
        await createRelease(formData);
      }

      navigate("/subscriptions/releases");
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/subscriptions/releases");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Release" : "Create New Release"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of your release"
            : "Create a new release for your project"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Version */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Version <span className="text-error">*</span>
          </label>
          <Input
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="1.0.0"
            error={errors.version}
            helper="Semantic version format: major.minor.patch"
            fullWidth
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-error">*</span>
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what's included in this release..."
            rows={4}
            error={errors.description}
            fullWidth
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RELEASE_STATUSES.map((status) => (
              <button
                key={status.value}
                type="button"
                className={`p-3 rounded-lg border-2 text-sm transition-all ${
                  formData.status === status.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: status.value }))
                }
              >
                <span className="text-lg block">{status.icon}</span>
                <span>{status.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Current status:{" "}
            <Badge variant={getStatusBadgeVariant(formData.status)} size="sm">
              {RELEASE_STATUSES.find((s) => s.value === formData.status)?.label}
            </Badge>
          </p>
        </div>

        {/* Release Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Release Date <span className="text-error">*</span>
          </label>
          <Input
            name="release_date"
            type="date"
            value={formData.release_date}
            onChange={handleChange}
            error={errors.release_date}
            fullWidth
          />
        </div>

        {/* Features Count (read-only for now) */}
        {isEditing && (
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-sm font-medium">Features in this release</p>
            <p className="text-sm text-neutral-500">
              {formData.features?.length || 0} features included
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Update Release" : "Create Release"}
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
    </div>
  );
};

export default ReleaseForm;
