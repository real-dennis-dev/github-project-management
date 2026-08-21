// src/components/project-management/ProjectForm.jsx

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
import useProjects from "./useProjects";
import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_FORM_INITIAL_VALUES,
  TECH_STACK_OPTIONS,
} from "./ProjectConstants";

const ProjectForm = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { createProject, updateProject, fetchProject, loading } = useProjects();

  const [formData, setFormData] = useState(PROJECT_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load project data if editing
  useEffect(() => {
    if (projectId) {
      setIsEditing(true);
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const project = await fetchProject();
      if (project) {
        setFormData({
          name: project.name || "",
          description: project.description || "",
          status: project.status || "planning",
          priority: project.priority || "medium",
          completion_percentage: project.completion_percentage || 0,
          tech_stack: project.tech_stack || [],
          repository_url: project.repository_url || "",
          start_date:
            project.start_date || new Date().toISOString().split("T")[0],
          target_completion_date: project.target_completion_date || "",
        });
      }
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle tech stack selection
  const handleTechStackChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, tech_stack: selected }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Project name must be at least 3 characters";
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
      const projectData = {
        ...formData,
        completion_percentage: parseInt(formData.completion_percentage) || 0,
      };

      let result;
      if (isEditing) {
        result = await updateProject(projectData);
        setSuccessMessage("Project updated successfully!");
      } else {
        result = await createProject(projectData);
        setSuccessMessage("Project created successfully!");
      }

      setShowSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        if (result && result.id) {
          navigate(`/projects/${result.id}`);
        } else {
          navigate("/projects");
        }
      }, 2000);
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/projects");
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
          {isEditing ? "Edit Project" : "Create New Project"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update your project details"
            : "Enter the details of your new project"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Project Name <span className="text-error">*</span>
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name..."
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
            placeholder="Describe your project..."
            rows={3}
            fullWidth
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {PROJECT_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              fullWidth
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Completion
            </label>
            <Input
              name="target_completion_date"
              type="date"
              value={formData.target_completion_date}
              onChange={handleChange}
              fullWidth
            />
          </div>
        </div>

        {/* Completion Percentage */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Completion Percentage: {formData.completion_percentage}%
          </label>
          <input
            type="range"
            name="completion_percentage"
            min="0"
            max="100"
            value={formData.completion_percentage}
            onChange={handleChange}
            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Repository URL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Repository URL
          </label>
          <Input
            name="repository_url"
            type="url"
            value={formData.repository_url}
            onChange={handleChange}
            placeholder="https://github.com/username/repo"
            fullWidth
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium mb-1">Tech Stack</label>
          <select
            name="tech_stack"
            multiple
            value={formData.tech_stack}
            onChange={handleTechStackChange}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
          >
            {TECH_STACK_OPTIONS.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-400 mt-1">
            Hold Ctrl/Cmd to select multiple
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
            {isEditing ? "Update Project" : "Create Project"}
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

export default ProjectForm;
