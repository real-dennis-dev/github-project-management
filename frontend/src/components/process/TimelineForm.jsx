// src/components/process/TimelineForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Alert,
  LoadingSpinner,
  Modal,
  ProgressBar,
  Breadcrumb,
} from "../common";
import useProcess from "./useProcess";
import {
  TIMELINE_FORM_INITIAL_VALUES,
  TIMELINE_FORM_VALIDATION,
  getProgressStatus,
} from "./ProcessConstants";

const TimelineForm = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const {
    createTimelineEntry,
    updateTimelineEntry,
    getTimelineEntryById,
    loading,
  } = useProcess();

  const [formData, setFormData] = useState(TIMELINE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Process", href: "/process" },
    { label: "Timeline", href: "/process/timeline" },
    { label: isEditing ? "Edit Entry" : "New Entry", href: "" },
  ];

  // Load entry data if editing
  useEffect(() => {
    if (entryId) {
      setIsEditing(true);
      loadEntry();
    }
  }, [entryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      const entry = await getTimelineEntryById(entryId);
      if (entry) {
        setFormData({
          month_year:
            entry.month_year || new Date().toISOString().split("T")[0],
          feature_name: entry.feature_name || "",
          progress_percentage: entry.progress_percentage || 0,
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
    const val = name === "progress_percentage" ? parseInt(value) || 0 : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle progress slider change
  const handleProgressChange = (value) => {
    const percentage = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      progress_percentage: Math.min(100, Math.max(0, percentage)),
    }));
    if (errors.progress_percentage) {
      setErrors((prev) => ({ ...prev, progress_percentage: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = TIMELINE_FORM_VALIDATION;

    // Check month_year
    if (rules.month_year.required && !formData.month_year) {
      newErrors.month_year = rules.month_year.required;
    }

    // Check feature_name
    if (rules.feature_name.required && !formData.feature_name) {
      newErrors.feature_name = rules.feature_name.required;
    } else if (formData.feature_name && rules.feature_name.maxLength) {
      if (formData.feature_name.length > rules.feature_name.maxLength.value) {
        newErrors.feature_name = rules.feature_name.maxLength.message;
      }
    }

    // Check progress_percentage
    if (
      rules.progress_percentage.required &&
      formData.progress_percentage === ""
    ) {
      newErrors.progress_percentage = rules.progress_percentage.required;
    } else if (formData.progress_percentage !== undefined) {
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
      const entryData = {
        ...formData,
        progress_percentage: parseInt(formData.progress_percentage) || 0,
      };

      let result;
      if (isEditing) {
        result = await updateTimelineEntry(entryId, entryData);
        setSuccessMessage("Timeline entry updated successfully!");
      } else {
        result = await createTimelineEntry(entryData);
        setSuccessMessage("Timeline entry created successfully!");
      }

      setShowSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        setFormData(TIMELINE_FORM_INITIAL_VALUES);
      }

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/process/timeline");
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/process/timeline");
  };

  // Get progress status
  const progressStatus = getProgressStatus(formData.progress_percentage || 0);

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
          {isEditing ? "Edit Timeline Entry" : "Add New Timeline Entry"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the progress details for this feature"
            : "Track progress for a new feature or milestone"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feature Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Feature Name <span className="text-error">*</span>
          </label>
          <Input
            name="feature_name"
            value={formData.feature_name}
            onChange={handleChange}
            placeholder="Enter feature or milestone name..."
            error={errors.feature_name}
            fullWidth
          />
        </div>

        {/* Month */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Month <span className="text-error">*</span>
          </label>
          <Input
            name="month_year"
            type="month"
            value={
              formData.month_year ? formData.month_year.substring(0, 7) : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setFormData((prev) => ({ ...prev, month_year: value + "-01" }));
              }
            }}
            error={errors.month_year}
            fullWidth
          />
          <p className="text-xs text-neutral-500 mt-1">
            Select the month when this progress was tracked
          </p>
        </div>

        {/* Progress Percentage */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Progress Percentage <span className="text-error">*</span>
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.progress_percentage}
                onChange={(e) => handleProgressChange(e.target.value)}
                className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-lg font-bold text-primary-500 min-w-[50px] text-right">
                {formData.progress_percentage}%
              </span>
            </div>
            <ProgressBar
              value={formData.progress_percentage}
              max={100}
              variant={progressStatus.class}
              size="md"
              showLabel
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500">Status:</span>
              <Badge
                variant={progressStatus.class}
                className="flex items-center gap-1"
              >
                <span>{progressStatus.icon}</span>
                <span>{progressStatus.label}</span>
              </Badge>
            </div>
            {errors.progress_percentage && (
              <p className="text-xs text-error">{errors.progress_percentage}</p>
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
            {isEditing ? "Update Entry" : "Create Entry"}
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

export default TimelineForm;
