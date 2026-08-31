// src/components/projects/BugForm.jsx
import React, { useState } from "react";
import { Button, Input, Textarea, Select } from "../common";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";

const BugForm = ({
  projectId,
  initialData = null,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { createBug, updateBug, isCreatingBug, isUpdatingBug } = useProjects();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "reported",
    priority: initialData?.priority || "medium",
    cause: initialData?.cause || "",
    possible_fix: initialData?.possible_fix || "",
    assigned_to: initialData?.assigned_to || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "reported", label: "Reported" },
    { value: "investigating", label: "Investigating" },
    { value: "in_progress", label: "In Progress" },
    { value: "fixed", label: "Fixed" },
    { value: "verified", label: "Verified" },
    { value: "closed", label: "Closed" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        project_id: projectId,
      };

      let result;
      if (isEditing && initialData) {
        result = await updateBug(initialData.id, data);
        if (result.success) {
          toast.success("Bug updated successfully");
          onSubmit?.(result.data);
        }
      } else {
        result = await createBug(projectId, data);
        if (result.success) {
          toast.success("Bug reported successfully");
          onSubmit?.(result.data);
        }
      }
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        toast.error(error.message || "Failed to save bug");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreatingBug || isUpdatingBug || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        name="title"
        label="Bug Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter bug title"
        required
        error={errors.title}
        fullWidth
      />

      <Textarea
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe the bug in detail"
        rows={4}
        error={errors.description}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          name="priority"
          label="Priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
          error={errors.priority}
          fullWidth
        />
      </div>

      <Textarea
        name="cause"
        label="Cause"
        value={formData.cause}
        onChange={handleChange}
        placeholder="What is causing this bug?"
        rows={2}
        error={errors.cause}
        fullWidth
      />

      <Textarea
        name="possible_fix"
        label="Possible Fix"
        value={formData.possible_fix}
        onChange={handleChange}
        placeholder="Suggest a possible fix"
        rows={2}
        error={errors.possible_fix}
        fullWidth
      />

      <Input
        name="assigned_to"
        label="Assigned To"
        value={formData.assigned_to}
        onChange={handleChange}
        placeholder="Name of assignee"
        error={errors.assigned_to}
        fullWidth
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
          {isEditing ? "Update Bug" : "Report Bug"}
        </Button>
      </div>
    </form>
  );
};

export default BugForm;
