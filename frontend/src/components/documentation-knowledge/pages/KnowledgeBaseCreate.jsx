// src/components/documentation-knowledge/pages/KnowledgeBaseCreate.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { Button, Input, Textarea, LoadingSpinner, Badge } from "../../common";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import TagManager from "../components/TagManager";
import { KNOWLEDGE_CATEGORIES } from "../utils/constants";

const KnowledgeBaseCreate = () => {
  const navigate = useNavigate();
  const { create, loading, loadCategories, categories } = useKnowledgeBase();

  const [formData, setFormData] = useState({
    category: "",
    topic: "",
    content: "",
    tags: [],
    related_links: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

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

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        related_links: [...prev.related_links, linkInput.trim()],
      }));
      setLinkInput("");
      setShowLinkInput(false);
    }
  };

  const handleRemoveLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      related_links: prev.related_links.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
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
      navigate(`/knowledge-base/${result.id}`);
    }
  };

  const handleCancel = () => {
    navigate("/knowledge-base");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/knowledge-base">
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
              Create Knowledge Entry
            </h1>
            <p className="text-sm text-neutral-500">
              Add new knowledge to your knowledge base
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Category <span className="text-error">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.category ? "border-error" : "border-neutral-300"
              }`}
            >
              <option value="">Select a category</option>
              {KNOWLEDGE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-error">{errors.category}</p>
            )}
          </div>

          {/* Topic */}
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              Topic <span className="text-error">*</span>
            </label>
            <Input
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Enter knowledge topic"
              error={errors.topic}
              fullWidth
            />
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
              placeholder="Write your knowledge content here..."
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

          {/* Related Links */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Related Links
            </label>
            {formData.related_links.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.related_links.map((link, index) => (
                  <Badge
                    key={index}
                    variant="neutral"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleRemoveLink(index)}
                  >
                    {link}
                    <X size={12} className="ml-1" />
                  </Badge>
                ))}
              </div>
            )}
            {showLinkInput ? (
              <div className="flex gap-2">
                <Input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Enter URL"
                  className="flex-1"
                />
                <Button variant="primary" size="sm" onClick={handleAddLink}>
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLinkInput(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLinkInput(true)}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                Add Link
              </Button>
            )}
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
            Create Entry
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KnowledgeBaseCreate;
