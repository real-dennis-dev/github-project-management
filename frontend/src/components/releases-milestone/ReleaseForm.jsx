// src/components/releases-milestone/ReleaseForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Alert,
  LoadingSpinner,
  Modal,
  Badge,
} from "../common";
import useReleasesMilestone from "./useReleasesMilestone";
import {
  RELEASE_STATUSES,
  RELEASE_FORM_INITIAL_VALUES,
  RELEASE_FORM_VALIDATION,
  getReleaseStatus,
} from "./ReleasesMilestoneConstants";

const ReleaseForm = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { createRelease, updateRelease, getReleaseById, releasesLoading } =
    useReleasesMilestone();

  const [formData, setFormData] = useState(RELEASE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
          release_date:
            release.release_date || new Date().toISOString().split("T")[0],
          features: release.features || [],
        });
      }
    } catch (err) {
      // Error is handled by the hook
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
    const rules = RELEASE_FORM_VALIDATION;

    // Check version
    if (rules.version.required && !formData.version) {
      newErrors.version = rules.version.required;
    } else if (formData.version && rules.version.pattern) {
      if (!rules.version.pattern.value.test(formData.version)) {
        newErrors.version = rules.version.pattern.message;
      }
    }

    // Check description
    if (formData.description && rules.description.maxLength) {
      if (formData.description.length > rules.description.maxLength.value) {
        newErrors.description = rules.description.maxLength.message;
      }
    }

    // Check status
    if (rules.status.required && !formData.status) {
      newErrors.status = rules.status.required;
    }

    // Check release_date
    if (rules.release_date.required && !formData.release_date) {
      newErrors.release_date = rules.release_date.required;
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
      const releaseData = {
        ...formData,
      };

      let result;
      if (isEditing) {
        result = await updateRelease(releaseId, releaseData);
        setSuccessMessage("Release updated successfully!");
      } else {
        result = await createRelease(releaseData);
        setSuccessMessage("Release created successfully!");
      }

      setShowSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        setFormData(RELEASE_FORM_INITIAL_VALUES);
      }

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/releases-milestone/releases");
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/releases-milestone/releases");
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
            : "Plan a new release for your project"}
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
            helper="Semantic versioning format: major.minor.patch"
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
            placeholder="Describe the release..."
            rows={4}
            error={errors.description}
            fullWidth
          />
        </div>

        {/* Status and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Status <span className="text-error">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.status
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {RELEASE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-error mt-1">{errors.status}</p>
            )}
          </div>
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
        </div>

        {/* Features (if editing) */}
        {isEditing && formData.features && formData.features.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature) => (
                <Badge
                  key={feature.id}
                  variant={feature.is_completed ? "success" : "secondary"}
                  className="flex items-center gap-1"
                >
                  <span>{feature.is_completed ? "✅" : "⏳"}</span>
                  <span>{feature.title}</span>
                </Badge>
              ))}
            </div>
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
          <p className="text-sm text-neutral-500 mt-2">Redirecting...</p>
        </div>
      </Modal>
    </div>
  );
};

export default ReleaseForm;
