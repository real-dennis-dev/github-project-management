// src/components/project-management/BugForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Alert,
  LoadingSpinner,
  Modal,
  Breadcrumb,
} from "../common";
import useProjects from "./useProjects";
import {
  BUG_STATUSES,
  BUG_PRIORITIES,
  BUG_FORM_INITIAL_VALUES,
  getBugStatus,
  getBugPriority,
} from "./ProjectConstants";

const BugForm = () => {
  const { projectId, bugId } = useParams();
  const navigate = useNavigate();
  const { project, bugs, createBug, updateBug, fetchProject, loading } =
    useProjects();

  const [formData, setFormData] = useState(BUG_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load project and bug data if editing
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    if (bugId) {
      setIsEditing(true);
      loadBug();
    }
  }, [projectId, bugId]);

  const loadBug = async () => {
    setIsLoading(true);
    try {
      // Find the bug in the existing bugs list
      const bug = bugs.find((b) => b.id === bugId);
      if (bug) {
        setFormData({
          title: bug.title || "",
          description: bug.description || "",
          status: bug.status || "reported",
          priority: bug.priority || "medium",
          cause: bug.cause || "",
          possible_fix: bug.possible_fix || "",
          assigned_to: bug.assigned_to || "",
        });
      }
    } catch (err) {
      console.error("Failed to load bug:", err);
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Bug title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Bug title must be at least 3 characters";
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
      let result;
      if (isEditing) {
        result = await updateBug(bugId, formData);
        setSuccessMessage("Bug updated successfully!");
      } else {
        result = await createBug(formData);
        setSuccessMessage("Bug created successfully!");
      }

      setShowSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/projects/${projectId}`);
      }, 2000);
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Projects", href: "/projects" },
    { label: project?.name || "Project", href: `/projects/${projectId}` },
    { label: "Bugs", href: `/projects/${projectId}` },
    { label: isEditing ? "Edit Bug" : "New Bug", href: "" },
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
          {isEditing ? "Edit Bug" : "Report New Bug"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of the bug"
            : "Report a bug in your project"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bug Title <span className="text-error">*</span>
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter bug title..."
            error={errors.title}
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
            placeholder="Describe the bug..."
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
              {BUG_STATUSES.map((status) => (
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
              {BUG_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium mb-1">Assigned To</label>
          <Input
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            placeholder="Developer name..."
            fullWidth
          />
        </div>

        {/* Cause and Possible Fix */}
        <div>
          <label className="block text-sm font-medium mb-1">Cause</label>
          <Input
            name="cause"
            value={formData.cause}
            onChange={handleChange}
            placeholder="What caused the bug..."
            fullWidth
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Possible Fix</label>
          <Textarea
            name="possible_fix"
            value={formData.possible_fix}
            onChange={handleChange}
            placeholder="Describe the possible fix..."
            rows={2}
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
            {isEditing ? "Update Bug" : "Report Bug"}
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

export default BugForm;
