// src/components/documentation-knowledge/pages/DocumentationEdit.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  LoadingSpinner,
  ErrorState,
} from "../../common";
import { useDocumentation } from "../hooks/useDocumentation";
import TagManager from "../components/TagManager";
import { DOCUMENTATION_TYPES } from "../utils/constants";

const DocumentationEdit = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const { documentation, loading, error, loadDocumentation, update } =
    useDocumentation(projectId);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    doc_type: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocumentation(id);
    }
  }, [id]);

  useEffect(() => {
    if (documentation) {
      setFormData({
        title: documentation.title || "",
        content: documentation.content || "",
        doc_type: documentation.doc_type || "",
        tags: documentation.tags || [],
      });
    }
  }, [documentation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTagsChange = (tags) => {
    setFormData((prev) => ({ ...prev, tags }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }
    if (!formData.doc_type) {
      newErrors.doc_type = "Document type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await update(id, formData);
    setIsSubmitting(false);

    if (result) {
      navigate(`/projects/${projectId}/documentation/${id}`);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}/documentation/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !documentation) {
    return (
      <ErrorState
        title="Documentation Not Found"
        description={error || "The requested documentation could not be found."}
        onRetry={() => loadDocumentation(id)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${projectId}/documentation/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Edit Documentation
            </h1>
            <p className="text-sm text-neutral-500">
              Update your documentation content
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Title <span className="text-error">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter document title"
              error={errors.title}
              fullWidth
            />
          </div>

          {/* Document Type */}
          <div>
            <label
              htmlFor="doc_type"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Document Type <span className="text-error">*</span>
            </label>
            <select
              id="doc_type"
              name="doc_type"
              value={formData.doc_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.doc_type ? "border-error" : "border-neutral-300"
              }`}
            >
              <option value="">Select document type</option>
              {DOCUMENTATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.doc_type && (
              <p className="mt-1 text-sm text-error">{errors.doc_type}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Content <span className="text-error">*</span>
            </label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your documentation content here..."
              rows={12}
              error={errors.content}
              fullWidth
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tags
            </label>
            <TagManager
              tags={formData.tags}
              onChange={handleTagsChange}
              placeholder="Add tags (press Enter to add)"
            />
          </div>

          {/* Version info */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <p className="text-sm text-neutral-600">
              Current Version:{" "}
              <span className="font-medium">{documentation.version || 1}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Saving changes will create a new version
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DocumentationEdit;
