// src/components/documentation-knowledge/KnowledgeList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { BookOpen, Plus, Edit, Trash2, Eye, Tag } from "lucide-react";

const KnowledgeList = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const {
    getKnowledgeEntries,
    knowledgeEntries,
    pagination,
    isLoading,
    error,
    clearError,
    getCategories,
    categories,
    deleteKnowledge,
    isDeletingKnowledge,
  } = useDocumentationKnowledge();
  const { toast } = useToast();

  const limit = 10;

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    const params = {
      limit,
      offset: (page - 1) * limit,
    };
    if (categoryFilter) params.category = categoryFilter;
    if (searchQuery) params.query = searchQuery;
    getKnowledgeEntries(params);
  }, [page, categoryFilter, searchQuery]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleDelete = async (id, topic) => {
    if (window.confirm(`Are you sure you want to delete "${topic}"?`)) {
      try {
        const result = await deleteKnowledge(id);
        if (result.success) {
          toast.success("Knowledge entry deleted successfully");
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete knowledge entry");
      }
    }
  };

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...(categories?.map((cat) => ({
      value: cat.category,
      label: `${cat.category} (${cat.count})`,
    })) || []),
  ];

  if (isLoading && knowledgeEntries.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (knowledgeEntries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Knowledge Base</h2>
          <Link to="/documentation-knowledge/knowledge/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Knowledge Entry
            </Button>
          </Link>
        </div>
        <EmptyState
          title="No Knowledge Entries"
          description="No knowledge entries have been created yet."
          icon={<BookOpen className="w-12 h-12 text-neutral-400" />}
          action={
            <Link to="/documentation-knowledge/knowledge/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Entry
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
        <h2 className="text-xl font-bold text-neutral-900">Knowledge Base</h2>
        <Link to="/documentation-knowledge/knowledge/new">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Knowledge Entry
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search knowledge base..."
          className="flex-1 min-w-[200px]"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryOptions}
          className="w-48"
        />
        <Badge variant="info" size="lg">
          {pagination.total} entries
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {knowledgeEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="info" size="sm">
                    {entry.category}
                  </Badge>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 2 && (
                        <Badge variant="neutral" size="sm">
                          +{entry.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {entry.topic}
                </h3>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-3">
                  {entry.content}
                </p>
                {entry.related_links && entry.related_links.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-neutral-500">
                      Related Links: {entry.related_links.length}
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                  <span>
                    Created: {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Updated: {new Date(entry.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Link to={`/documentation-knowledge/knowledge/${entry.id}`}>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link
                  to={`/documentation-knowledge/knowledge/${entry.id}/edit`}
                >
                  <Button variant="ghost" size="sm" className="p-2">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-error hover:text-error"
                  onClick={() => handleDelete(entry.id, entry.topic)}
                  loading={isDeletingKnowledge}
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

export default KnowledgeList;
