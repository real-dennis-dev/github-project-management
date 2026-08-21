// src/components/subscriptions/MilestoneForm.jsx

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
  ProgressBar,
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  MILESTONE_STATUSES,
  MILESTONE_FORM_INITIAL_VALUES,
  getStatusBadgeVariant,
  formatDate,
} from "./SubscriptionsConstants";

const MilestoneForm = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const { createMilestone, updateMilestone, getMilestoneById, loading } =
    useSubscriptions();

  const [formData, setFormData] = useState(MILESTONE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load milestone data if editing
  useEffect(() => {
    if (milestoneId) {
      setIsEditing(true);
      loadMilestone();
    }
  }, [milestoneId]);

  const loadMilestone = async () => {
    setIsLoading(true);
    try {
      const milestone = await getMilestoneById(milestoneId);
      if (milestone) {
        setFormData({
          name: milestone.name || "",
          description: milestone.description || "",
          status: milestone.status || "not_started",
          target_date: milestone.target_date || "",
          completed_date: milestone.completed_date || "",
          progress_percentage: milestone.progress_percentage || 0,
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
    const { name, value, type } = e.target;
    const val = type === "number" ? parseInt(value) || 0 : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Validate target date
    if (!formData.target_date) {
      newErrors.target_date = "Target date is required";
    }

    // Validate progress percentage
    if (
      formData.progress_percentage < 0 ||
      formData.progress_percentage > 100
    ) {
      newErrors.progress_percentage = "Progress must be between 0 and 100";
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
        await updateMilestone(milestoneId, formData);
      } else {
        await createMilestone(formData);
      }

      navigate("/subscriptions/milestones");
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/subscriptions/milestones");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statusInfo = getMilestoneStatus(formData.status);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Milestone" : "Create New Milestone"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of your milestone"
            : "Create a new milestone for your project"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-error">*</span>
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter milestone name"
            error={errors.name}
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
            placeholder="Describe the milestone..."
            rows={3}
            fullWidth
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MILESTONE_STATUSES.map((status) => (
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
                <span className="text-xs">{status.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Current status:{" "}
            <Badge
              variant={getStatusBadgeVariant(formData.status, "milestone")}
              size="sm"
            >
              {statusInfo.icon} {statusInfo.label}
            </Badge>
          </p>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Target Date <span className="text-error">*</span>
          </label>
          <Input
            name="target_date"
            type="date"
            value={formData.target_date}
            onChange={handleChange}
            error={errors.target_date}
            fullWidth
          />
        </div>

        {/* Completed Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Completed Date
          </label>
          <Input
            name="completed_date"
            type="date"
            value={formData.completed_date}
            onChange={handleChange}
            helper="Leave empty if not completed yet"
            fullWidth
          />
        </div>

        {/* Progress Percentage */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Progress: {formData.progress_percentage}%
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="progress_percentage"
              min="0"
              max="100"
              value={formData.progress_percentage}
              onChange={handleChange}
              className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {formData.progress_percentage}%
            </span>
          </div>
          <ProgressBar
            value={formData.progress_percentage}
            max={100}
            variant={
              formData.progress_percentage === 100
                ? "success"
                : formData.progress_percentage >= 50
                ? "primary"
                : "neutral"
            }
            size="sm"
            className="mt-2"
            showLabel
          />
          {errors.progress_percentage && (
            <p className="text-xs text-error mt-1">
              {errors.progress_percentage}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Update Milestone" : "Create Milestone"}
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

export default MilestoneForm;
