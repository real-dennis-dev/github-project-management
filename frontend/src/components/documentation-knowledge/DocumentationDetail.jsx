// src/components/documentation-knowledge/DocumentationDetail.jsx
import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDocumentationKnowledge } from "../../hooks/useDocumentationKnowledge";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Badge, Button, EmptyState } from "../common";
import DocumentTypeBadge from "./DocumentTypeBadge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  FileText,
  Code,
  GitBranch,
  GitMerge,
  Users,
  MoreHorizontal,
} from "lucide-react";

const DocumentationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getDocumentationItem,
    currentDocumentation,
    isLoading,
    error,
    clearError,
    deleteDocumentation,
    isDeletingDocumentation,
  } = useDocumentationKnowledge();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      getDocumentationItem(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${currentDocumentation?.title}"?`
      )
    ) {
      try {
        const result = await deleteDocumentation(id);
        if (result.success) {
          toast.success("Documentation deleted successfully");
          navigate("/documentation-knowledge");
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete documentation");
      }
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      api: Code,
      erd: GitBranch,
      flowchart: GitMerge,
      user_manual: Users,
      technical: FileText,
      other: MoreHorizontal,
    };
    return icons[type] || FileText;
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

  if (!currentDocumentation) {
    return (
      <EmptyState
        title="Documentation Not Found"
        description="The documentation you're looking for doesn't exist or has been deleted."
        icon={<FileText className="w-12 h-12 text-neutral-400" />}
        action={
          <Link to="/documentation-knowledge">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        }
      />
    );
  }

  const TypeIcon = getTypeIcon(currentDocumentation.doc_type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/documentation-knowledge">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                {currentDocumentation.title}
              </h1>
              <DocumentTypeBadge type={currentDocumentation.doc_type} />
              {currentDocumentation.version && (
                <Badge variant="neutral" size="sm">
                  v{currentDocumentation.version}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Created: {formatDate(currentDocumentation.created_at)}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Updated: {formatDate(currentDocumentation.updated_at)}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/documentation-knowledge/documentation/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={isDeletingDocumentation}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tags */}
      {currentDocumentation.tags && currentDocumentation.tags.length > 0 && (
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-neutral-500" />
          <div className="flex flex-wrap gap-2">
            {currentDocumentation.tags.map((tag) => (
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
          {currentDocumentation.content.split("\n").map((paragraph, index) => (
            <p key={index} className="text-neutral-800 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
        <h3 className="text-sm font-medium text-neutral-700 mb-2">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-neutral-500">ID</p>
            <p className="text-neutral-700 font-mono text-xs">
              {currentDocumentation.id}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Type</p>
            <p className="text-neutral-700 capitalize">
              {currentDocumentation.doc_type}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Version</p>
            <p className="text-neutral-700">
              {currentDocumentation.version || 1}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Project</p>
            <p className="text-neutral-700 font-mono text-xs">
              {currentDocumentation.project_id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationDetail;
