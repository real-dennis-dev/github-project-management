// src/components/documentation-knowledge/components/DocumentationCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  Tag,
  Eye,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../../common";
import { formatDate, getDocTypeLabel, getDocTypeColor } from "../utils/helpers";

const DocumentationCard = ({
  id,
  title,
  content,
  doc_type,
  tags,
  version,
  created_at,
  updated_at,
  projectId,
  viewMode = "grid",
}) => {
  const truncatedContent =
    content?.length > 150 ? content.substring(0, 150) + "..." : content;

  if (viewMode === "list") {
    return (
      <Link
        to={`/projects/${projectId}/documentation/${id}`}
        className="block bg-white rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-neutral-400 flex-shrink-0" />
              <h3 className="font-medium text-neutral-900 truncate">{title}</h3>
              <Badge variant={getDocTypeColor(doc_type)} size="sm">
                {getDocTypeLabel(doc_type)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <GitBranch size={14} />v{version || 1}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(updated_at)}
              </span>
              {tags && tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag size={14} />
                  {tags.slice(0, 2).join(", ")}
                  {tags.length > 2 && ` +${tags.length - 2}`}
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={18} className="text-neutral-400 flex-shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/projects/${projectId}/documentation/${id}`}
      className="block bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{title}</h3>
          <Badge variant={getDocTypeColor(doc_type)} size="sm" className="mt-1">
            {getDocTypeLabel(doc_type)}
          </Badge>
        </div>
        <Badge variant="neutral" size="sm" className="flex items-center gap-1">
          <GitBranch size={12} />v{version || 1}
        </Badge>
      </div>

      {content && (
        <p className="text-sm text-neutral-600 line-clamp-3 mb-3">
          {truncatedContent}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {formatDate(updated_at)}
        </span>
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={14} />
            <span>{tags.length} tags</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default DocumentationCard;
