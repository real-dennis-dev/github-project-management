// src/components/documentation-knowledge/KnowledgeDetail.jsx
import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDocumentationKnowledge } from "../../hooks/useDocumentationKnowledge";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Badge, Button, EmptyState } from "../common";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  BookOpen,
  Link as LinkIcon,
} from "lucide-react";

const KnowledgeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getKnowledgeItem,
    currentKnowledge,
    isLoading,
    error,
    clearError,
    deleteKnowledge,
    isDeletingKnowledge,
  } = useDocumentationKnowledge();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      getKnowledgeItem(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${currentKnowledge?.topic}"?`
      )
    ) {
      try {
        const result = await deleteKnowledge(id);
        if (result.success) {
          toast.success("Knowledge entry deleted successfully");
          navigate("/documentation-knowledge/knowledge");
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete knowledge entry");
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentKnowledge) {
    return (
      <EmptyState
        title="Knowledge Entry Not Found"
        description="The knowledge entry you're looking for doesn't exist or has been deleted."
        icon={<BookOpen className="w-12 h-12 text-neutral-400" />}
        action={
          <Link to="/documentation-knowledge/knowledge">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/documentation-knowledge/knowledge">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {currentKnowledge.topic}
              </h1>
              <Badge variant="info" size="lg">
                {currentKnowledge.category}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Created: {formatDate(currentKnowledge.created_at)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Updated: {formatDate(currentKnowledge.updated_at)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/documentation-knowledge/knowledge/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={isDeletingKnowledge}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tags */}
      {currentKnowledge.tags && currentKnowledge.tags.length > 0 && (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-neutral-500" />
          <div className="flex flex-wrap gap-2">
            {currentKnowledge.tags.map((tag) => (
              <Badge key={tag} variant="primary" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="prose prose-neutral max-w-none">
          {currentKnowledge.content.split("\n").map((paragraph, index) => (
            <p key={index} className="text-neutral-800 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Related Links */}
      {currentKnowledge.related_links &&
        currentKnowledge.related_links.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" />
              Related Links
            </h3>
            <ul className="space-y-1">
              {currentKnowledge.related_links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 hover:underline text-sm break-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Meta */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-700 mb-2">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-neutral-500">ID</p>
            <p className="text-neutral-700 font-mono text-xs">
              {currentKnowledge.id}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Category</p>
            <p className="text-neutral-700">{currentKnowledge.category}</p>
          </div>
          <div>
            <p className="text-neutral-500">Tags</p>
            <p className="text-neutral-700">
              {currentKnowledge.tags?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDetail;
