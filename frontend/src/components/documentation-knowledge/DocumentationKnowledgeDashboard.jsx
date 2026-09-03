// src/components/documentation-knowledge/DocumentationKnowledgeDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentationKnowledge } from "../../hooks/useDocumentationKnowledge";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Badge,
  Button,
  SearchBar,
  Pagination,
} from "../common";
import DocumentationStats from "./DocumentationStats";
import ActivityFeed from "./ActivityFeed";
import {
  FileText,
  BookOpen,
  Plus,
  Search,
  FileCheck,
  Layers,
} from "lucide-react";

const DocumentationKnowledgeDashboard = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const limit = 20;

  const {
    stats,
    recentItems,
    pagination,
    isLoading,
    isStatsLoading,
    isStatsFetching,
    error,
    clearError,
    clearSearch,
    searchResults,
    isSearching,
    searchDocumentation,
    searchKnowledge,
  } = useDocumentationKnowledge({
    statsParams: {
      limit,
      offset: (page - 1) * limit,
      sortBy: "updated_at",
      sortOrder: "desc",
    },
  });

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      clearSearch();
      return;
    }

    setSearchQuery(query);
    try {
      // Search both documentation and knowledge base
      const docResults = await searchDocumentation("", { query, limit: 10 });
      const knowledgeResults = await searchKnowledge({ query, limit: 10 });

      // Combine results
      const combined = [
        ...(docResults?.data?.data || []).map((item) => ({
          ...item,
          type: "documentation",
        })),
        ...(knowledgeResults?.data?.data || []).map((item) => ({
          ...item,
          type: "knowledge",
        })),
      ];
      // Store will handle setting search results via the query hooks
    } catch (err) {
      toast.error("Search failed");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearch();
  };

  const getTypeLabel = (type) => {
    return type === "documentation" ? "Documentation" : "Knowledge";
  };

  const getTypeColor = (type) => {
    return type === "documentation" ? "primary" : "info";
  };

  if (isLoading && !stats) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  const showSearchResults = isSearching && searchResults.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Layers className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Documentation & Knowledge Base
            </h1>
            <p className="text-sm text-neutral-500">
              Manage all project documentation and knowledge articles
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/documentation-knowledge/documentation/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Documentation
            </Button>
          </Link>
          <Link to="/documentation-knowledge/knowledge/new">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Knowledge Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <SearchBar
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onClear={handleClearSearch}
          placeholder="Search documentation and knowledge base..."
          className="flex-1"
        />
        <Badge variant="info" size="lg">
          {stats?.totals?.combined || 0} total items
        </Badge>
      </div>

      {/* Stats */}
      {stats && <DocumentationStats stats={stats} />}

      {/* Activity Feed */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Recent Activity
        </h2>
        <ActivityFeed items={recentItems} />
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Search Results
          </h2>
          <div className="space-y-3">
            {searchResults.map((item) => (
              <Link
                key={item.id}
                to={
                  item.type === "documentation"
                    ? `/documentation-knowledge/documentation/${item.id}`
                    : `/documentation-knowledge/knowledge/${item.id}`
                }
                className="block bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getTypeColor(item.type)} size="sm">
                        {getTypeLabel(item.type)}
                      </Badge>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="neutral" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="neutral" size="sm">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mt-1">
                      {item.title || item.topic}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm text-neutral-500 mt-1">
                        {item.subtitle}
                      </p>
                    )}
                    {item.relevance !== undefined && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Relevance: {(item.relevance * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Updated:{" "}
                    {new Date(
                      item.updatedAt || item.updated_at
                    ).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && !showSearchResults && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default DocumentationKnowledgeDashboard;
