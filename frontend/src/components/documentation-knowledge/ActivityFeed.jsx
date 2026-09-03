// src/components/documentation-knowledge/ActivityFeed.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Badge, EmptyState } from "../common";
import { FileText, BookOpen, Clock, ChevronRight } from "lucide-react";

const ActivityFeed = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No Recent Activity"
        description="No documentation or knowledge entries have been created or updated recently."
        icon={<Clock className="w-12 h-12 text-neutral-400" />}
      />
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
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
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Badge variant={getTypeColor(item.type)} size="sm">
                  {getTypeIcon(item.type)}
                  <span className="ml-1">{getTypeLabel(item.type)}</span>
                </Badge>
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
              <h3 className="text-base font-medium text-neutral-900 mt-1">
                {item.title || item.topic || "Untitled"}
              </h3>
              {item.subtitle && (
                <p className="text-sm text-neutral-500 mt-1">{item.subtitle}</p>
              )}
              {item.projectId && (
                <p className="text-xs text-neutral-400 mt-1">
                  Project ID: {item.projectId}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-neutral-400">
                  {item.updatedAt || item.updated_at ? (
                    <>
                      Updated: {formatDate(item.updatedAt || item.updated_at)}
                    </>
                  ) : (
                    <>
                      Created: {formatDate(item.createdAt || item.created_at)}
                    </>
                  )}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ActivityFeed;
