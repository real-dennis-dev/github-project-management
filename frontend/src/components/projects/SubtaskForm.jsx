// src/components/projects/SubtaskForm.jsx
import React, { useState } from "react";
import { Button, Input, Checkbox } from "../common";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";

const SubtaskForm = ({
  featureId,
  initialData = null,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { createSubtask, updateSubtask, isCreatingSubtask, isUpdatingSubtask } =
    useProjects();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    is_completed: initialData?.is_completed || false,
    order_index: initialData?.order_index || 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        feature_id: featureId,
      };

      let result;
      if (isEditing && initialData) {
        result = await updateSubtask(initialData.id, data);
        if (result.success) {
          toast.success("Subtask updated successfully");
          onSubmit?.(result.data);
        }
      } else {
        result = await createSubtask(featureId, data);
        if (result.success) {
          toast.success("Subtask added successfully");
          onSubmit?.(result.data);
        }
      }
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        toast.error(error.message || "Failed to save subtask");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreatingSubtask || isUpdatingSubtask || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        label="Subtask Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter subtask title"
        required
        error={errors.title}
        fullWidth
      />

      <Checkbox
        name="is_completed"
        label="Completed"
        checked={formData.is_completed}
        onChange={handleChange}
        error={errors.is_completed}
      />

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
          {isEditing ? "Update Subtask" : "Add Subtask"}
        </Button>
      </div>
    </form>
  );
};

export default SubtaskForm;
