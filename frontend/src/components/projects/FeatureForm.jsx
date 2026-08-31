// src/components/projects/FeatureForm.jsx
import React, { useState } from "react";
import { Button, Input, Textarea, Select } from "../common";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";

const FeatureForm = ({
  projectId,
  initialData = null,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { createFeature, updateFeature, isCreatingFeature, isUpdatingFeature } =
    useProjects();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "planned",
    difficulty: initialData?.difficulty || "medium",
    estimated_days: initialData?.estimated_days || "",
    order_index: initialData?.order_index || 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "blocked", label: "Blocked" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "expert", label: "Expert" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value ? parseInt(value) : "";
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        project_id: projectId,
        estimated_days: formData.estimated_days
          ? parseInt(formData.estimated_days)
          : null,
      };

      let result;
      if (isEditing && initialData) {
        result = await updateFeature(initialData.id, data);
        if (result.success) {
          toast.success("Feature updated successfully");
          onSubmit?.(result.data);
        }
      } else {
        result = await createFeature(projectId, data);
        if (result.success) {
          toast.success("Feature created successfully");
          onSubmit?.(result.data);
        }
      }
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        toast.error(error.message || "Failed to save feature");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreatingFeature || isUpdatingFeature || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        name="title"
        label="Feature Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter feature title"
        required
        error={errors.title}
        fullWidth
      />

      <Textarea
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter feature description"
        rows={3}
        error={errors.description}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.status}
          fullWidth
        />

        <Select
          name="difficulty"
          label="Difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          options={difficultyOptions}
          error={errors.difficulty}
          fullWidth
        />

        <Input
          name="estimated_days"
          label="Estimated Days"
          type="number"
          value={formData.estimated_days}
          onChange={handleNumberChange}
          placeholder="e.g., 5"
          min="1"
          error={errors.estimated_days}
          fullWidth
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-300">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? "Update Feature" : "Create Feature"}
        </Button>
      </div>
    </form>
  );
};

export default FeatureForm;
