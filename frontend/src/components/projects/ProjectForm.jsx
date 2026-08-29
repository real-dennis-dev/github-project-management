// src/components/projects/ProjectForm.jsx
import React, { useState } from "react";
import { Button, Input, Textarea, Select, Checkbox } from "../common";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";

const ProjectForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { createProject, updateProject, isCreatingProject, isUpdatingProject } =
    useProjects();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    status: initialData?.status || "planning",
    priority: initialData?.priority || "medium",
    completion_percentage: initialData?.completion_percentage || 0,
    tech_stack: initialData?.tech_stack || [],
    repository_url: initialData?.repository_url || "",
    start_date: initialData?.start_date || "",
    target_completion_date: initialData?.target_completion_date || "",
  });

  const [techStackInput, setTechStackInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "planning", label: "Planning" },
    { value: "in_progress", label: "In Progress" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

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

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [name]: Math.min(100, Math.max(0, numValue)),
    }));
  };

  const handleAddTechStack = () => {
    if (
      techStackInput.trim() &&
      !formData.tech_stack.includes(techStackInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techStackInput.trim()],
      }));
      setTechStackInput("");
    }
  };

  const handleRemoveTechStack = (tech) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tech),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      let result;
      if (isEditing && initialData) {
        result = await updateProject(initialData.id, formData);
        if (result.success) {
          toast.success("Project updated successfully");
          onSubmit?.(result.data);
        }
      } else {
        result = await createProject(formData);
        if (result.success) {
          toast.success("Project created successfully");
          onSubmit?.(result.data);
        }
      }
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        toast.error(error.message || "Failed to save project");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreatingProject || isUpdatingProject || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        name="name"
        label="Project Name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter project name"
        required
        error={errors.name}
        fullWidth
      />

      <Textarea
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter project description"
        rows={3}
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

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Completion Percentage
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            name="completion_percentage"
            min="0"
            max="100"
            value={formData.completion_percentage}
            onChange={handleNumberChange}
            className="flex-1"
          />
          <span className="text-sm font-medium text-neutral-700 w-12">
            {formData.completion_percentage}%
          </span>
        </div>
        {errors.completion_percentage && (
          <p className="mt-1 text-sm text-error">
            {errors.completion_percentage}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Tech Stack
        </label>
        <div className="flex space-x-2">
          <Input
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            placeholder="Add technology"
            className="flex-1"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTechStack())
            }
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTechStack}
          >
            Add
          </Button>
        </div>
        {formData.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tech_stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-2 py-1 bg-neutral-200 rounded-full text-sm text-neutral-700"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTechStack(tech)}
                  className="ml-1 text-neutral-500 hover:text-neutral-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Input
        name="repository_url"
        label="Repository URL"
        type="url"
        value={formData.repository_url}
        onChange={handleChange}
        placeholder="https://github.com/..."
        error={errors.repository_url}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="start_date"
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
          error={errors.start_date}
          fullWidth
        />

        <Input
          name="target_completion_date"
          label="Target Completion Date"
          type="date"
          value={formData.target_completion_date}
          onChange={handleChange}
          error={errors.target_completion_date}
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
          {isEditing ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
