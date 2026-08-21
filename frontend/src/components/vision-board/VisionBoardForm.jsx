// src/components/vision-board/VisionBoardForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Select,
  Alert,
  LoadingSpinner,
  Modal,
} from "../common";
import useVisionBoard from "./useVisionBoard";
import {
  STATUSES,
  PRIORITIES,
  VISION_GOAL_FORM_INITIAL_VALUES,
  VISION_GOAL_FORM_VALIDATION,
  DEFAULT_CATEGORIES,
} from "./VisionBoardConstants";

const VisionBoardForm = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const {
    createVisionGoal,
    updateVisionGoal,
    getVisionGoalById,
    categories,
    loading,
  } = useVisionBoard();

  const [formData, setFormData] = useState(VISION_GOAL_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Load goal data if editing
  useEffect(() => {
    if (goalId) {
      setIsEditing(true);
      loadGoal();
    }
  }, [goalId]);

  const loadGoal = async () => {
    setIsLoading(true);
    try {
      const goal = await getVisionGoalById(goalId);
      if (goal) {
        setFormData({
          goal: goal.goal || "",
          description: goal.description || "",
          target_timeline: goal.target_timeline || "",
          priority: goal.priority || 0,
          category: goal.category || "",
          status: goal.status || "draft",
        });
        if (goal.category && !DEFAULT_CATEGORIES.includes(goal.category)) {
          setCustomCategory(goal.category);
        }
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

  // Handle category change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setFormData((prev) => ({ ...prev, category: customCategory }));
    } else {
      setFormData((prev) => ({ ...prev, category: value }));
    }
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  // Handle custom category input
  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    if (formData.category === "custom" || formData.category === value) {
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = VISION_GOAL_FORM_VALIDATION;

    // Check goal
    if (rules.goal.required && !formData.goal) {
      newErrors.goal = rules.goal.required;
    } else if (formData.goal && rules.goal.minLength) {
      if (formData.goal.length < rules.goal.minLength.value) {
        newErrors.goal = rules.goal.minLength.message;
      }
    } else if (formData.goal && rules.goal.maxLength) {
      if (formData.goal.length > rules.goal.maxLength.value) {
        newErrors.goal = rules.goal.maxLength.message;
      }
    }

    // Check description
    if (formData.description && rules.description.maxLength) {
      if (formData.description.length > rules.description.maxLength.value) {
        newErrors.description = rules.description.maxLength.message;
      }
    }

    // Check priority
    if (formData.priority !== undefined) {
      if (rules.priority.min && formData.priority < rules.priority.min.value) {
        newErrors.priority = rules.priority.min.message;
      }
      if (rules.priority.max && formData.priority > rules.priority.max.value) {
        newErrors.priority = rules.priority.max.message;
      }
    }

    // Check status
    if (rules.status.required && !formData.status) {
      newErrors.status = rules.status.required;
    }

    // Check category
    if (!formData.category) {
      newErrors.category = "Category is required";
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
      const goalData = { ...formData };

      let result;
      if (isEditing) {
        result = await updateVisionGoal(goalId, goalData);
        setSuccessMessage("Vision goal updated successfully!");
      } else {
        result = await createVisionGoal(goalData);
        setSuccessMessage("Vision goal created successfully!");
      }

      setShowSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        setFormData(VISION_GOAL_FORM_INITIAL_VALUES);
        setCustomCategory("");
      }

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/vision-board");
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/vision-board");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const allCategories = [...DEFAULT_CATEGORIES];
  if (customCategory && !allCategories.includes(customCategory)) {
    allCategories.push(customCategory);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Vision Goal" : "Create New Vision Goal"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of your vision goal"
            : "Define a new goal for your vision board"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Goal <span className="text-error">*</span>
          </label>
          <Textarea
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="What is your vision goal?"
            rows={2}
            error={errors.goal}
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
            placeholder="Provide more details about this goal..."
            rows={3}
            error={errors.description}
            fullWidth
          />
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-error">*</span>
            </label>
            <select
              name="category"
              value={
                allCategories.includes(formData.category)
                  ? formData.category
                  : "custom"
              }
              onChange={handleCategoryChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.category
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              <option value="">Select a category</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="custom">+ Add Custom Category</option>
            </select>
            {errors.category && (
              <p className="text-xs text-error mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Category Input */}
        {(formData.category === "custom" ||
          (formData.category &&
            !DEFAULT_CATEGORIES.includes(formData.category))) && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Custom Category <span className="text-error">*</span>
            </label>
            <Input
              value={customCategory}
              onChange={handleCustomCategoryChange}
              placeholder="Enter custom category name..."
              fullWidth
            />
          </div>
        )}

        {/* Target Timeline and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Timeline
            </label>
            <Input
              name="target_timeline"
              value={formData.target_timeline}
              onChange={handleChange}
              placeholder="e.g., Q1 2025, December 2025"
              fullWidth
            />
          </div>
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
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-error mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Update Goal" : "Create Goal"}
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
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-lg font-medium">{successMessage}</p>
          <p className="text-sm text-neutral-500 mt-2">Redirecting...</p>
        </div>
      </Modal>
    </div>
  );
};

export default VisionBoardForm;
