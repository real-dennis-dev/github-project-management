// src/components/tech-debt/TechDebtForm.jsx

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
  Breadcrumb,
} from "../common";
import useTechDebt from "./useTechDebt";
import {
  PRIORITIES,
  STATUSES,
  TECH_DEBT_FORM_INITIAL_VALUES,
  TECH_DEBT_FORM_VALIDATION,
} from "./TechDebtConstants";

const TechDebtForm = () => {
  const { techDebtId } = useParams();
  const navigate = useNavigate();
  const { createItem, updateItem, getItemById, loading } = useTechDebt();

  const [formData, setFormData] = useState(TECH_DEBT_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load tech debt data if editing
  useEffect(() => {
    if (techDebtId) {
      setIsEditing(true);
      loadItem();
    }
  }, [techDebtId]);

  const loadItem = async () => {
    setIsLoading(true);
    try {
      const item = await getItemById(techDebtId);
      if (item) {
        setFormData({
          title: item.title || "",
          description: item.description || "",
          reason: item.reason || "",
          impact: item.impact || "",
          priority: item.priority || "medium",
          status: item.status || "identified",
          estimated_effort_hours: item.estimated_effort_hours || "",
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
    const rules = TECH_DEBT_FORM_VALIDATION;

    // Check title
    if (rules.title.required && !formData.title) {
      newErrors.title = rules.title.required;
    } else if (formData.title && rules.title.minLength) {
      if (formData.title.length < rules.title.minLength.value) {
        newErrors.title = rules.title.minLength.message;
      }
    } else if (formData.title && rules.title.maxLength) {
      if (formData.title.length > rules.title.maxLength.value) {
        newErrors.title = rules.title.maxLength.message;
      }
    }

    // Check description
    if (rules.description.required && !formData.description) {
      newErrors.description = rules.description.required;
    } else if (formData.description && rules.description.minLength) {
      if (formData.description.length < rules.description.minLength.value) {
        newErrors.description = rules.description.minLength.message;
      }
    }

    // Check reason
    if (rules.reason.required && !formData.reason) {
      newErrors.reason = rules.reason.required;
    } else if (formData.reason && rules.reason.minLength) {
      if (formData.reason.length < rules.reason.minLength.value) {
        newErrors.reason = rules.reason.minLength.message;
      }
    }

    // Check priority
    if (rules.priority.required && !formData.priority) {
      newErrors.priority = rules.priority.required;
    }

    // Check status
    if (rules.status.required && !formData.status) {
      newErrors.status = rules.status.required;
    }

    // Check estimated effort
    if (formData.estimated_effort_hours && rules.estimated_effort_hours.min) {
      if (
        parseInt(formData.estimated_effort_hours) <
        rules.estimated_effort_hours.min.value
      ) {
        newErrors.estimated_effort_hours =
          rules.estimated_effort_hours.min.message;
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
      const techDebtData = {
        ...formData,
        estimated_effort_hhours: formData.estimated_effort_hours
          ? parseInt(formData.estimated_effort_hours)
          : undefined,
      };

      let result;
      if (isEditing) {
        result = await updateItem(techDebtId, techDebtData);
        setSuccessMessage("Tech debt item updated successfully!");
      } else {
        result = await createItem(techDebtData);
        setSuccessMessage("Tech debt item created successfully!");
      }

      setShowSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        setFormData(TECH_DEBT_FORM_INITIAL_VALUES);
      }

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/tech-debt");
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/tech-debt");
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Tech Debt", href: "/tech-debt" },
    { label: isEditing ? "Edit" : "New", href: "" },
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
          {isEditing ? "Edit Tech Debt Item" : "Add New Tech Debt Item"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of your tech debt item"
            : "Enter the details of your new tech debt item"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Title <span className="text-error">*</span>
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a clear title for the tech debt..."
            error={errors.title}
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
            placeholder="Describe the technical debt in detail..."
            rows={4}
            error={errors.description}
            fullWidth
          />
        </div>

        {/* Reason and Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Reason <span className="text-error">*</span>
            </label>
            <Textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Why does this tech debt exist?"
              rows={3}
              error={errors.reason}
              fullWidth
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Impact</label>
            <Textarea
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              placeholder="What is the impact of this tech debt?"
              rows={3}
              fullWidth
            />
          </div>
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Priority <span className="text-error">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.priority
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-xs text-error mt-1">{errors.priority}</p>
            )}
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
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-error mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Estimated Effort */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Estimated Effort (hours)
          </label>
          <Input
            name="estimated_effort_hours"
            type="number"
            min="0"
            step="1"
            value={formData.estimated_effort_hours}
            onChange={handleChange}
            placeholder="Estimated hours to resolve"
            error={errors.estimated_effort_hours}
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
            {isEditing ? "Update Item" : "Create Item"}
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

export default TechDebtForm;
