// src/components/documentation-knowledge/SearchResults.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Badge, Button, LoadingSpinner } from "../common";
import DocumentTypeBadge from "./DocumentTypeBadge";
import { FileText, BookOpen, X, ChevronRight, Search } from "lucide-react";

const SearchResults = ({
  results = [],
  isLoading = false,
  onClear,
  total = 0,
  query = "",
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!query && results.length === 0) {
    return null;
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-8">
        <Search className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No results found for "{query}"</p>
        <p className="text-sm text-neutral-400 mt-1">
          Try adjusting your search terms
        </p>
        <Button variant="ghost" size="sm" onClick={onClear} className="mt-4">
          Clear Search
        </Button>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    return type === "documentation" ? (
      <FileText className="w-4 h-4" />
    ) : (
      <BookOpen className="w-4 h-4" />
    );
  };

  const getTypeColor = (type) => {
    return type === "documentation" ? "primary" : "info";
  };

  const getTypeLabel = (type) => {
    return type === "documentation" ? "Documentation" : "Knowledge";
  };

  const getDetailPath = (item) => {
    if (item.type === "documentation") {
      return `/documentation-knowledge/documentation/${item.id}`;
    }
    return `/documentation-knowledge/knowledge/${item.id}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-neutral-900">
            Search Results
          </h3>
          <Badge variant="info" size="sm">
            {total} results
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        {results.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            to={getDetailPath(item)}
            className="block bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={getTypeColor(item.type)} size="sm">
                    {getTypeIcon(item.type)}
                    <span className="ml-1">{getTypeLabel(item.type)}</span>
                  </Badge>
                  {item.doc_type && (
                    <DocumentTypeBadge type={item.doc_type} size="sm" />
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="neutral" size="sm">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="neutral" size="sm">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <h4 className="text-base font-medium text-neutral-900 mt-1">
                  {item.title || item.topic || "Untitled"}
                </h4>
                {item.subtitle && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {item.subtitle}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-400">
                  <span>
                    Updated: {formatDate(item.updatedAt || item.updated_at)}
                  </span>
                  {item.relevance !== undefined && (
                    <span>Relevance: {(item.relevance * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0 ml-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
