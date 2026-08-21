// src/components/releases-milestone/MilestoneForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Alert,
  LoadingSpinner,
  Modal,
  Select,
} from "../common";
import useReleasesMilestone from "./useReleasesMilestone";
import {
  MILESTONE_STATUSES,
  MILESTONE_PRIORITIES,
  MILESTONE_FORM_INITIAL_VALUES,
  MILESTONE_FORM_VALIDATION,
  getMilestoneStatus,
  getMilestonePriority,
} from "./ReleasesMilestoneConstants";

const MilestoneForm = () => {
  const { milestoneId } = useParams();
  const navigate = useNavigate();
  const {
    createMilestone,
    updateMilestone,
    getMilestoneById,
    milestonesLoading,
  } = useReleasesMilestone();

  const [formData, setFormData] = useState(MILESTONE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
          target_date:
            milestone.target_date || new Date().toISOString().split("T")[0],
          completed_date: milestone.completed_date || "",
          progress_percentage: milestone.progress_percentage || 0,
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
    const rules = MILESTONE_FORM_VALIDATION;

    // Check name
    if (rules.name.required && !formData.name) {
      newErrors.name = rules.name.required;
    } else if (formData.name && rules.name.minLength) {
      if (formData.name.length < rules.name.minLength.value) {
        newErrors.name = rules.name.minLength.message;
      }
    } else if (formData.name && rules.name.maxLength) {
      if (formData.name.length > rules.name.maxLength.value) {
        newErrors.name = rules.name.maxLength.message;
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

    // Check target_date
    if (rules.target_date.required && !formData.target_date) {
      newErrors.target_date = rules.target_date.required;
    }

    // Check progress_percentage
    if (formData.progress_percentage !== undefined) {
      if (formData.progress_percentage < rules.progress_percentage.min.value) {
        newErrors.progress_percentage = rules.progress_percentage.min.message;
      } else if (
        formData.progress_percentage > rules.progress_percentage.max.value
      ) {
        newErrors.progress_percentage = rules.progress_percentage.max.message;
      }
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
      const milestoneData = {
        ...formData,
        progress_percentage: parseInt(formData.progress_percentage) || 0,
      };

      let result;
      if (isEditing) {
        result = await updateMilestone(milestoneId, milestoneData);
        setSuccessMessage("Milestone updated successfully!");
      } else {
        result = await createMilestone(milestoneData);
        setSuccessMessage("Milestone created successfully!");
      }

      setShowSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        setFormData(MILESTONE_FORM_INITIAL_VALUES);
      }

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/releases-milestone/milestones");
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/releases-milestone/milestones");
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
            placeholder="Enter milestone name..."
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
            error={errors.description}
            fullWidth
          />
        </div>

        {/* Status and Priority */}
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
              {MILESTONE_STATUSES.map((status) => (
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
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority || "medium"}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {MILESTONE_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1">
              Completed Date
            </label>
            <Input
              name="completed_date"
              type="date"
              value={formData.completed_date}
              onChange={handleChange}
              fullWidth
              disabled={formData.status !== "completed"}
            />
            {formData.status === "completed" && (
              <p className="text-xs text-neutral-500 mt-1">
                Set the date when this milestone was completed
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Progress Percentage
          </label>
          <div className="flex items-center gap-4">
            <Input
              name="progress_percentage"
              type="number"
              min="0"
              max="100"
              value={formData.progress_percentage}
              onChange={handleChange}
              error={errors.progress_percentage}
              className="w-32"
              fullWidth={false}
            />
            <span className="text-sm text-neutral-500">%</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Enter a value between 0 and 100
          </p>
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

export default MilestoneForm;
