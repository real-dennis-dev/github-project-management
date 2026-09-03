// src/components/documentation-knowledge/DocumentationList.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDocumentationKnowledge } from "../../hooks/useDocumentationKnowledge";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Badge,
  Button,
  SearchBar,
  Select,
} from "../common";
import DocumentTypeBadge from "./DocumentTypeBadge";
import { FileText, Plus, Edit, Trash2, Eye, Search } from "lucide-react";

const DocumentationList = () => {
  const { projectId } = useParams();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const {
    getDocumentation,
    documentation,
    pagination,
    isLoading,
    error,
    clearError,
    deleteDocumentation,
    isDeletingDocumentation,
  } = useDocumentationKnowledge();
  const { toast } = useToast();

  const limit = 10;

  useEffect(() => {
    if (projectId) {
      const params = {
        limit,
        offset: (page - 1) * limit,
      };
      if (docTypeFilter) params.type = docTypeFilter;
      if (searchQuery) params.query = searchQuery;
      getDocumentation(projectId, params);
    }
  }, [projectId, page, docTypeFilter, searchQuery]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const result = await deleteDocumentation(id);
        if (result.success) {
          toast.success("Documentation deleted successfully");
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete documentation");
      }
    }
  };

  const docTypeOptions = [
    { value: "", label: "All Types" },
    { value: "api", label: "API" },
    { value: "erd", label: "ERD" },
    { value: "flowchart", label: "Flowchart" },
    { value: "user_manual", label: "User Manual" },
    { value: "technical", label: "Technical" },
    { value: "other", label: "Other" },
  ];

  if (isLoading && documentation.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (documentation.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Documentation</h2>
          <Link to="/documentation-knowledge/documentation/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Documentation
            </Button>
          </Link>
        </div>
        <EmptyState
          title="No Documentation"
          description="No documentation has been created for this project yet."
          icon={<FileText className="w-12 h-12 text-neutral-400" />}
          action={
            <Link to="/documentation-knowledge/documentation/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Document
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-neutral-900">Documentation</h2>
        <div className="flex items-center space-x-3">
          <Link to="/documentation-knowledge/documentation/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Documentation
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search documentation..."
          className="flex-1 min-w-[200px]"
        />
        <Select
          value={docTypeFilter}
          onChange={(e) => setDocTypeFilter(e.target.value)}
          options={docTypeOptions}
          className="w-40"
        />
        <Badge variant="info" size="lg">
          {pagination.total} documents
        </Badge>
      </div>

      <div className="space-y-4">
        {documentation.map((doc) => (
          <div
            key={doc.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTypeBadge type={doc.doc_type} />
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge variant="neutral" size="sm">
                          +{doc.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {doc.title}
                </h3>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                  {doc.content}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                  <span>Version: {doc.version || 1}</span>
                  <span>
                    Created: {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Link to={`/documentation-knowledge/documentation/${doc.id}`}>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  to={`/documentation-knowledge/documentation/${doc.id}/edit`}
                >
                  <Button variant="ghost" size="sm" className="p-2">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-error hover:text-error"
                  onClick={() => handleDelete(doc.id, doc.title)}
                  loading={isDeletingDocumentation}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default DocumentationList;
