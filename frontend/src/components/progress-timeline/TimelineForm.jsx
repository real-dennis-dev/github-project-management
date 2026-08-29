// src/components/progress-timeline/TimelineForm.jsx
import React, { useState, useEffect } from "react";
import { useProgress } from "../../hooks/useProgress";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Alert } from "../common";
import { Calendar, TrendingUp } from "lucide-react";

const TimelineForm = ({
  projectId,
  initialData = null,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    month_year: "",
    feature_name: "",
    progress_percentage: 0,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const {
    addTimelineEntry,
    updateTimelineEntry,
    isLoading,
    error,
    clearError,
  } = useProgress();
  const { toast } = useToast();

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        month_year: initialData.month_year || "",
        feature_name: initialData.feature_name || "",
        progress_percentage: initialData.progress_percentage || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    try {
      let result;
      if (isEdit) {
        result = await updateTimelineEntry(initialData.id, formData);
      } else {
        result = await addTimelineEntry(projectId, formData);
      }

      if (result.success) {
        toast.success(
          isEdit
            ? "Timeline entry updated successfully"
            : "Timeline entry added successfully"
        );
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // Errors handled by useProgress hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Month <span className="text-error">*</span>
        </label>
        <Input
          type="month"
          name="month_year"
          value={formData.month_year}
          onChange={handleChange}
          required
          fullWidth
          error={validationErrors.month_year}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Feature Name <span className="text-error">*</span>
        </label>
        <Input
          type="text"
          name="feature_name"
          value={formData.feature_name}
          onChange={handleChange}
          placeholder="Enter feature name"
          required
          fullWidth
          error={validationErrors.feature_name}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Progress Percentage <span className="text-error">*</span>
        </label>
        <div className="flex items-center space-x-4">
          <Input
            type="number"
            name="progress_percentage"
            value={formData.progress_percentage}
            onChange={handleChange}
            min="0"
            max="100"
            required
            fullWidth
            error={validationErrors.progress_percentage}
            disabled={isLoading}
          />
          <span className="text-sm text-neutral-500">%</span>
        </div>
        <input
          type="range"
          name="progress_percentage"
          value={formData.progress_percentage}
          onChange={handleChange}
          min="0"
          max="100"
          className="w-full mt-2"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {isEdit ? "Update" : "Add"} Entry
        </Button>
      </div>
    </form>
  );
};

export default TimelineForm;
