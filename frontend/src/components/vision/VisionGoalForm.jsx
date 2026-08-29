// src/components/vision/VisionGoalForm.jsx
import React, { useState, useEffect } from "react";
import { useVision } from "../../hooks/useVision";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Select, Alert } from "../common";

const VisionGoalForm = ({ initialData, onSuccess, onCancel }) => {
  const { createGoal, updateGoal, isLoading, error, clearError, options } =
    useVision();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    goal: initialData?.goal || "",
    description: initialData?.description || "",
    target_timeline: initialData?.target_timeline || "",
    priority: initialData?.priority || 0,
    category: initialData?.category || "",
    status: initialData?.status || "draft",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];

  const priorityOptions = [
    { value: 0, label: "Low (0)" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "Medium (5)" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "High (10)" },
  ];

  const categoryOptions =
    options?.categories?.map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    })) || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    try {
      let result;
      if (initialData?.id) {
        result = await updateGoal(initialData.id, formData);
      } else {
        result = await createGoal(formData);
      }

      if (result.success) {
        toast.success(
          initialData?.id
            ? "Vision goal updated successfully"
            : "Vision goal created successfully"
        );
        if (onSuccess) {
          onSuccess(result.data);
        }
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div>
        <Input
          label="Goal"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          placeholder="What do you want to achieve?"
          required
          fullWidth
        />
        {validationErrors.goal && (
          <p className="mt-1 text-sm text-error">{validationErrors.goal}</p>
        )}
      </div>

      <div>
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your vision goal in more detail..."
          rows={4}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            fullWidth
          />
        </div>

        <div>
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            fullWidth
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Target Timeline"
            name="target_timeline"
            type="date"
            value={formData.target_timeline}
            onChange={handleChange}
            fullWidth
          />
        </div>

        <div>
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
            fullWidth
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-4 border-t border-neutral-300">
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {initialData?.id ? "Update Goal" : "Create Goal"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default VisionGoalForm;
