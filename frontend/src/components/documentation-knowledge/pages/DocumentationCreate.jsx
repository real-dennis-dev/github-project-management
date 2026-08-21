// src/components/documentation-knowledge/pages/DocumentationCreate.jsx

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  LoadingSpinner,
} from "../../common";
import { useDocumentation } from "../hooks/useDocumentation";
import TagManager from "../components/TagManager";
import { DOCUMENTATION_TYPES } from "../utils/constants";

const DocumentationCreate = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { create, loading } = useDocumentation(projectId);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    doc_type: "",
    tags: [],
    version: 1,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const result = await create(formData);
    setIsSubmitting(false);

    if (result) {
      navigate(`/projects/${projectId}/documentation/${result.id}`);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}/documentation`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${projectId}/documentation`}>
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
              Create Documentation
            </h1>
            <p className="text-sm text-neutral-500">
              Add new documentation to your project
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
            {/* Document Type */}
            <Select
              id="doc_type"
              name="doc_type"
              label={
                <>
                  Document Type <span className="text-error">*</span>
                </>
              }
              value={formData.doc_type}
              onChange={handleChange}
              placeholder="Select document type"
              options={DOCUMENTATION_TYPES}
              error={errors.doc_type}
              fullWidth
            />
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
            <p className="mt-1 text-xs text-neutral-500">
              Press Enter to add a tag, click on a tag to remove it
            </p>
          </div>

          {/* Version */}
          <div>
            <label
              htmlFor="version"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Version
            </label>
            <Input
              id="version"
              name="version"
              type="number"
              value={formData.version}
              onChange={handleChange}
              min={1}
              className="w-32"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Start with version 1 for new documents
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
            Create Documentation
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DocumentationCreate;
